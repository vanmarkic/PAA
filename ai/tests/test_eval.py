"""Tests for the evaluation framework — golden sets, retrieval/agent metrics."""

from __future__ import annotations

from pathlib import Path

from ai.eval import golden_sets, retrieval_eval
from ai.eval.golden_sets import GoldenCase
from ai.eval.hallucination_check import lexical_faithfulness
from ai.rag.retriever import ChunkResult

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_parse_features_returns_cases():
    cases = golden_sets.parse_features(REPO_ROOT)
    assert len(cases) > 100, f"expected many golden cases, got {len(cases)}"
    sample = cases[:50]
    assert all(c.case_id and c.scenario_name for c in sample)
    # Every case should reference at least its own gherkin doc as expected.
    assert all(any(d.startswith("gherkin:") for d in c.expected_doc_ids) for c in sample)


def test_aggregate_metrics_perfect_match():
    case_results = [
        retrieval_eval.CaseEvalResult(
            case_id="c1",
            query="q1",
            expected_doc_ids=["gherkin:foo#1"],
            retrieved_doc_ids=["gherkin:foo#1", "x", "y"],
            hits=[True, False, False],
            rr=1.0,
        ),
        retrieval_eval.CaseEvalResult(
            case_id="c2",
            query="q2",
            expected_doc_ids=["gherkin:bar#1"],
            retrieved_doc_ids=["x", "gherkin:bar#1", "y"],
            hits=[False, True, False],
            rr=0.5,
        ),
    ]
    metrics = retrieval_eval.aggregate(case_results, top_k=3)
    assert metrics.total == 2
    assert 0 < metrics.precision_at_k < 1
    assert metrics.recall_at_k == 1.0
    assert 0.5 < metrics.mrr <= 1.0


def test_aggregate_metrics_no_results():
    metrics = retrieval_eval.aggregate([], top_k=5)
    assert metrics.total == 0
    assert metrics.precision_at_k == 0
    assert metrics.recall_at_k == 0


def test_lexical_faithfulness_high_when_overlap():
    chunks = [
        ChunkResult(
            id="c1",
            document_id="d1",
            source_type="rule",
            title="T",
            content="Le RIS est versé aux personnes isolées sans ressources suffisantes.",
            metadata={},
            language="fr",
            source_path="src/rules/r.ts",
            score=1.0,
        )
    ]
    score = lexical_faithfulness(
        "Le RIS est versé aux personnes isolées.", chunks
    )
    assert score > 0.5


def test_lexical_faithfulness_low_when_unsupported():
    chunks = [
        ChunkResult(
            id="c1",
            document_id="d1",
            source_type="rule",
            title="T",
            content="alpha beta gamma",
            metadata={},
            language="fr",
            source_path="src/rules/r.ts",
            score=1.0,
        )
    ]
    score = lexical_faithfulness("xenon krypton argon", chunks)
    assert score < 0.2


def test_golden_case_extracts_amount_and_eligibility():
    cases = golden_sets.parse_features(REPO_ROOT)
    has_amount = sum(1 for c in cases if c.expected_amount is not None)
    has_eligible = sum(1 for c in cases if c.expected_eligible is not None)
    assert has_amount > 0
    assert has_eligible > 0


def test_golden_case_dataclass_round_trip():
    c = GoldenCase(
        case_id="x", feature_file="f", feature_title="t", scenario_name="s", query="q"
    )
    assert c.case_id == "x"
    assert c.facts == {}
    assert c.expected_doc_ids == []
