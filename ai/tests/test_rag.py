"""Tests for RAG pipeline components that don't require a live database."""

from __future__ import annotations

from ai.ingest.embedder import StubEmbedder
from ai.rag.generator import _build_context, _confidence_from_chunks, generate
from ai.rag.reranker import PassthroughReranker
from ai.rag.retriever import ChunkResult, rrf_fuse


def _mk(id_: str, score: float = 0.0, source_type: str = "procedure") -> ChunkResult:
    return ChunkResult(
        id=id_,
        document_id=id_.split("#")[0],
        source_type=source_type,
        title=id_,
        content=f"content of {id_}",
        metadata={},
        language="fr",
        source_path=f"src/{id_}.ts",
        score=score,
    )


def test_stub_embedder_is_deterministic_and_unit_norm():
    e = StubEmbedder(dim=128)
    a, b = e.embed(["hello world", "hello world"])
    assert a == b
    norm_sq = sum(x * x for x in a)
    assert abs(norm_sq - 1.0) < 1e-6


def test_stub_embedder_distinguishes_inputs():
    e = StubEmbedder(dim=128)
    a, b = e.embed(["alpha", "beta"])
    assert a != b


def test_stub_embedder_default_dim_is_1024():
    """Schema is vector(1024). Stub default must match so tests round-trip."""
    e = StubEmbedder()
    [v] = e.embed(["hello"])
    assert len(v) == 1024


def test_stub_embedder_accepts_input_type():
    e = StubEmbedder(dim=64)
    [doc] = e.embed(["query"], input_type="document")
    [query] = e.embed(["query"], input_type="query")
    # Stub doesn't differentiate, but accepting the kwarg is the contract.
    assert doc == query


def test_rrf_fuses_two_rankings():
    semantic = [_mk("a"), _mk("b"), _mk("c")]
    keyword = [_mk("b"), _mk("a"), _mk("d")]
    fused = rrf_fuse([semantic, keyword], k=60, top_k=4)
    ids = [r.id for r in fused]
    # 'a' and 'b' both appear at rank 1 and rank 2 across the two rankings — they
    # should outrank items appearing only once.
    assert ids[0] in {"a", "b"}
    assert ids[1] in {"a", "b"}
    assert "c" in ids
    assert "d" in ids


def test_passthrough_reranker_truncates():
    chunks = [_mk("a"), _mk("b"), _mk("c"), _mk("d")]
    out = PassthroughReranker().rerank("query", chunks, top_k=2)
    assert [c.id for c in out] == ["a", "b"]


def test_get_reranker_falls_back_to_passthrough_without_keys(monkeypatch):
    monkeypatch.delenv("COHERE_API_KEY", raising=False)
    monkeypatch.delenv("VOYAGE_API_KEY", raising=False)
    from ai.config import get_settings
    from ai.rag.reranker import get_reranker

    get_settings.cache_clear()
    r = get_reranker()
    assert r.name == "passthrough"


def test_get_embedder_resolves_to_stub_without_keys(monkeypatch):
    """Auto-selection lands on stub when no embedding provider is configured."""
    for k in ("VOYAGE_API_KEY", "COHERE_API_KEY", "OPENAI_API_KEY"):
        monkeypatch.delenv(k, raising=False)
    from ai.config import get_settings
    from ai.ingest.embedder import get_embedder

    get_settings.cache_clear()
    e = get_embedder()
    # Stub or local — depending on whether sentence_transformers is importable
    # in the test env. Either way, no API key is leaked.
    assert e.name in {"stub", "local"}


def test_generator_stub_mode_cites_top_chunk(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from ai.config import get_settings

    get_settings.cache_clear()
    chunks = [_mk("rule:agr"), _mk("procedure:agr")]
    answer = generate("Suis-je éligible à l'AGR?", chunks)
    assert "rule:agr" in answer.answer or "procedure:agr" in answer.answer
    assert set(answer.sources) >= {"rule:agr", "procedure:agr"}
    assert 0.0 <= answer.confidence <= 1.0


def test_generator_handles_empty_context(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from ai.config import get_settings

    get_settings.cache_clear()
    answer = generate("Question sans contexte", [])
    assert answer.confidence == 0.0
    assert "CPAS" in answer.answer or "administration" in answer.answer


def test_build_context_includes_all_chunks():
    chunks = [_mk("a"), _mk("b")]
    ctx = _build_context(chunks)
    assert "Source 1" in ctx and "Source 2" in ctx
    assert "[a]" in ctx and "[b]" in ctx


def test_confidence_higher_when_top_dominates():
    high = _confidence_from_chunks([_mk("a", score=0.9), _mk("b", score=0.1)])
    low = _confidence_from_chunks([_mk("a", score=0.5), _mk("b", score=0.49)])
    assert high > low
