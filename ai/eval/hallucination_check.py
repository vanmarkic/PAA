"""Faithfulness / hallucination check — is the answer grounded in retrieved chunks?

Two strategies:
1. LLM-as-judge (default when an Anthropic key is available): prompt Claude
   with (question, retrieved_chunks, answer) and ask it to score faithfulness
   on a 0–1 scale.
2. Lexical-overlap fallback (always available): Jaccard similarity between the
   answer's content tokens and the retrieved chunks' content tokens. A weak
   proxy, but useful as a smoke test in CI.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

from ai.config import get_settings
from ai.rag.generator import generate
from ai.rag.retriever import ChunkResult, HybridRetriever

_TOKEN_RE = re.compile(r"\b\w{3,}\b", re.UNICODE)
_STOP = {
    "le", "la", "les", "de", "des", "et", "ou", "un", "une", "que", "qui",
    "pour", "dans", "sur", "par", "vous", "nous", "est", "ne", "pas", "the",
    "and", "of", "to", "in", "is", "for", "you", "this", "that", "with",
}


def _tokens(text: str) -> set[str]:
    return {t.lower() for t in _TOKEN_RE.findall(text or "") if t.lower() not in _STOP}


def lexical_faithfulness(answer: str, chunks: list[ChunkResult]) -> float:
    answer_tokens = _tokens(answer)
    if not answer_tokens:
        return 0.0
    context_tokens: set[str] = set()
    for c in chunks:
        context_tokens |= _tokens(c.content)
    overlap = answer_tokens & context_tokens
    return len(overlap) / len(answer_tokens)


JUDGE_PROMPT_FR = """Tu es un évaluateur strict.

Question: {question}

Contexte (sources autorisées):
{context}

Réponse à évaluer:
{answer}

Évalue la fidélité de la réponse au contexte. Une réponse est fidèle si chaque
affirmation factuelle est étayée par le contexte. Tolère le langage de
prudence (ex. "consultez votre CPAS"). Pénalise toute affirmation factuelle
non étayée.

Réponds UNIQUEMENT avec un JSON valide:
{{"faithfulness": <float entre 0 et 1>, "unsupported_claims": [<liste>], "rationale": "<courte phrase>"}}
"""


def llm_faithfulness(question: str, answer: str, chunks: list[ChunkResult]) -> dict:
    settings = get_settings()
    if not settings.has_anthropic:
        return {
            "faithfulness": lexical_faithfulness(answer, chunks),
            "unsupported_claims": [],
            "rationale": "lexical fallback (no LLM judge configured)",
            "method": "lexical",
        }
    from anthropic import Anthropic  # noqa: PLC0415

    client = Anthropic(api_key=settings.anthropic_api_key)
    context = "\n\n".join(
        f"[{c.document_id}] {c.content[:600]}" for c in chunks
    )
    prompt = JUDGE_PROMPT_FR.format(question=question, context=context, answer=answer)
    resp = client.messages.create(
        model=settings.llm_model,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
    try:
        data = json.loads(text.strip())
        data["method"] = "llm-judge"
        return data
    except json.JSONDecodeError:
        return {
            "faithfulness": lexical_faithfulness(answer, chunks),
            "unsupported_claims": [],
            "rationale": f"LLM returned non-JSON: {text[:200]}",
            "method": "llm-judge-failed",
        }


@dataclass
class FaithfulnessResult:
    query: str
    faithfulness: float
    method: str
    answer: str
    sources: list[str]
    unsupported_claims: list[str]
    rationale: str = ""


def evaluate_query(query: str, top_k: int = 5) -> FaithfulnessResult:
    retriever = HybridRetriever()
    chunks = retriever.search(query, top_k=top_k)
    answer = generate(query, chunks)
    judgement = llm_faithfulness(query, answer.answer, chunks)
    return FaithfulnessResult(
        query=query,
        faithfulness=float(judgement.get("faithfulness", 0.0)),
        method=judgement.get("method", "unknown"),
        answer=answer.answer,
        sources=answer.sources,
        unsupported_claims=judgement.get("unsupported_claims", []),
        rationale=judgement.get("rationale", ""),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Faithfulness check on RAG answers.")
    parser.add_argument(
        "--queries-file",
        type=Path,
        default=None,
        help="Path to a text file with one query per line.",
    )
    parser.add_argument(
        "--query",
        action="append",
        default=None,
        help="Inline query (repeatable). Overrides --queries-file when provided.",
    )
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args(argv)

    if args.query:
        queries = list(args.query)
    elif args.queries_file and args.queries_file.exists():
        queries = [
            ln.strip()
            for ln in args.queries_file.read_text(encoding="utf-8").splitlines()
            if ln.strip()
        ]
    else:
        queries = [
            "Je suis parent isolé avec un revenu de 1200€/mois. Ai-je droit au RIS?",
            "Quelles sont les conditions pour l'AGR si je travaille à temps partiel?",
        ]

    results = [evaluate_query(q, args.top_k) for q in queries]
    avg = sum(r.faithfulness for r in results) / max(1, len(results))

    output = args.output or _default_output("hallucination")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "kind": "hallucination",
                "timestamp": datetime.utcnow().isoformat(),
                "average_faithfulness": avg,
                "method": results[0].method if results else "n/a",
                "results": [asdict(r) for r in results],
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    print(f"Faithfulness eval over {len(results)} queries:")
    print(f"  Average faithfulness: {avg:.3f}")
    print(f"  Method:               {results[0].method if results else 'n/a'}")
    print(f"  Report:               {output}")
    return 0


def _default_output(kind: str) -> Path:
    here = Path(__file__).parent
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    return here / "results" / f"{kind}-{stamp}.json"


if __name__ == "__main__":
    raise SystemExit(main())
