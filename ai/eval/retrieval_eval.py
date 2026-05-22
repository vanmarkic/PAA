"""Retrieval evaluation: P@k, R@k, MRR using Gherkin scenarios as golden truth.

For each Gherkin scenario we know which procedure/rule it implements (via the
`@implemented-by` header). The eval feeds the scenario's natural-language steps
to the retriever and checks whether the expected documents appear in the top-k.

CLI:
    uv run python -m ai.eval.retrieval_eval --top-k 5
    uv run python -m ai.eval.retrieval_eval --top-k 5 --max-queries 100 --output results/retrieval.json
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path

from ai.eval.golden_sets import GoldenCase, parse_features
from ai.rag.retriever import HybridRetriever


@dataclass
class CaseEvalResult:
    case_id: str
    query: str
    expected_doc_ids: list[str]
    retrieved_doc_ids: list[str] = field(default_factory=list)
    hits: list[bool] = field(default_factory=list)
    rr: float = 0.0


@dataclass
class AggregateMetrics:
    total: int = 0
    precision_at_k: float = 0.0
    recall_at_k: float = 0.0
    mrr: float = 0.0
    elapsed_seconds: float = 0.0


def evaluate_case(
    retriever: HybridRetriever,
    case: GoldenCase,
    top_k: int,
) -> CaseEvalResult:
    candidates = retriever.search(case.query, top_k=top_k)
    retrieved_ids = [c.document_id for c in candidates]
    expected = set(case.expected_doc_ids)
    hits = [doc_id in expected for doc_id in retrieved_ids]
    rr = 0.0
    for i, hit in enumerate(hits, start=1):
        if hit:
            rr = 1.0 / i
            break
    return CaseEvalResult(
        case_id=case.case_id,
        query=case.query,
        expected_doc_ids=list(case.expected_doc_ids),
        retrieved_doc_ids=retrieved_ids,
        hits=hits,
        rr=rr,
    )


def aggregate(case_results: list[CaseEvalResult], top_k: int) -> AggregateMetrics:
    if not case_results:
        return AggregateMetrics()
    n = len(case_results)
    total_precision = 0.0
    total_recall = 0.0
    total_rr = 0.0
    for r in case_results:
        relevant_retrieved = sum(r.hits)
        total_precision += relevant_retrieved / max(1, top_k)
        total_recall += (
            relevant_retrieved / len(set(r.expected_doc_ids)) if r.expected_doc_ids else 0.0
        )
        total_rr += r.rr
    return AggregateMetrics(
        total=n,
        precision_at_k=total_precision / n,
        recall_at_k=total_recall / n,
        mrr=total_rr / n,
    )


def run(
    repo_root: Path,
    top_k: int,
    max_queries: int | None,
) -> tuple[AggregateMetrics, list[CaseEvalResult]]:
    cases = parse_features(repo_root)
    if max_queries is not None:
        cases = cases[:max_queries]
    retriever = HybridRetriever()
    started = time.perf_counter()
    case_results: list[CaseEvalResult] = []
    for i, case in enumerate(cases, start=1):
        try:
            case_results.append(evaluate_case(retriever, case, top_k))
        except Exception as e:  # noqa: BLE001
            case_results.append(
                CaseEvalResult(
                    case_id=case.case_id,
                    query=case.query,
                    expected_doc_ids=case.expected_doc_ids,
                    retrieved_doc_ids=[],
                    hits=[],
                    rr=0.0,
                )
            )
            print(f"  [{i}/{len(cases)}] {case.case_id}: error: {e}", file=sys.stderr)
        if i % 25 == 0:
            print(f"  evaluated {i}/{len(cases)} queries", file=sys.stderr)
    metrics = aggregate(case_results, top_k)
    metrics.elapsed_seconds = time.perf_counter() - started
    return metrics, case_results


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Retrieval eval over Gherkin golden sets.")
    parser.add_argument("--repo-root", type=Path, default=Path("."))
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--max-queries", type=int, default=None)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args(argv)

    repo_root = args.repo_root.resolve()
    metrics, case_results = run(repo_root, args.top_k, args.max_queries)

    output = args.output or _default_output("retrieval")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "kind": "retrieval",
                "timestamp": datetime.utcnow().isoformat(),
                "top_k": args.top_k,
                "metrics": asdict(metrics),
                "cases": [asdict(c) for c in case_results],
            },
            indent=2,
            ensure_ascii=False,
        )
    )

    print(f"Retrieval eval over {metrics.total} cases (top_k={args.top_k}):")
    print(f"  Precision@{args.top_k}: {metrics.precision_at_k:.3f}")
    print(f"  Recall@{args.top_k}:    {metrics.recall_at_k:.3f}")
    print(f"  MRR:                  {metrics.mrr:.3f}")
    print(f"  Elapsed:              {metrics.elapsed_seconds:.1f}s")
    print(f"  Report:               {output}")
    return 0


def _default_output(kind: str) -> Path:
    here = Path(__file__).parent
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    return here / "results" / f"{kind}-{stamp}.json"


if __name__ == "__main__":
    raise SystemExit(main())
