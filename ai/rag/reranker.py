"""Re-rank a candidate set with a cross-encoder.

Default backend is Cohere `rerank-v3.5`. When `COHERE_API_KEY` is unset, falls
back to a passthrough that preserves the upstream order — same call shape, no
secret required, so retriever-only smoke tests still work.
"""

from __future__ import annotations

from typing import Protocol

from ai.config import get_settings
from ai.rag.retriever import ChunkResult


class Reranker(Protocol):
    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]: ...


class PassthroughReranker:
    """Return the first `top_k` chunks unchanged. Used when no API key is set."""

    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]:
        return chunks[:top_k]


class CohereReranker:
    """Calls Cohere's `rerank` endpoint. Lazy import so tests don't require the SDK."""

    def __init__(self, model: str, api_key: str) -> None:
        import cohere  # type: ignore

        self._client = cohere.Client(api_key=api_key)
        self._model = model

    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]:
        if not chunks:
            return []
        documents = [c.content for c in chunks]
        resp = self._client.rerank(
            model=self._model,
            query=query,
            documents=documents,
            top_n=min(top_k, len(documents)),
        )
        out: list[ChunkResult] = []
        for hit in resp.results:
            chunk = chunks[hit.index]
            chunk.score = float(hit.relevance_score)
            out.append(chunk)
        return out


def get_reranker() -> Reranker:
    settings = get_settings()
    if settings.has_cohere:
        try:
            return CohereReranker(model=settings.reranker_model, api_key=settings.cohere_api_key)  # type: ignore[arg-type]
        except ImportError:
            return PassthroughReranker()
    return PassthroughReranker()
