"""Re-rank a candidate set with a cross-encoder.

Backends: Cohere `rerank-v3.5`, Voyage `rerank-2`. When no rerank API key is
available the pipeline falls back to a passthrough that preserves upstream
order — same call shape, no secret required, retriever-only smoke tests still
work.

Selection: explicit `RERANKER_PROVIDER` setting or `auto` (Cohere → Voyage →
passthrough).
"""

from __future__ import annotations

from typing import Protocol

from ai.config import get_settings
from ai.rag.retriever import ChunkResult


class Reranker(Protocol):
    name: str

    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]: ...


class PassthroughReranker:
    name = "passthrough"

    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]:
        return chunks[:top_k]


class CohereReranker:
    name = "cohere"

    def __init__(self, model: str, api_key: str) -> None:
        import cohere  # type: ignore  # noqa: PLC0415

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


class VoyageReranker:
    name = "voyage"

    def __init__(self, model: str, api_key: str) -> None:
        import voyageai  # type: ignore  # noqa: PLC0415

        self._client = voyageai.Client(api_key=api_key)
        # Default to Voyage's general-purpose reranker if the configured model
        # is the Cohere one (or anything that doesn't look like a Voyage model).
        self._model = model if model.startswith("rerank-") else "rerank-2"

    def rerank(
        self, query: str, chunks: list[ChunkResult], top_k: int
    ) -> list[ChunkResult]:
        if not chunks:
            return []
        documents = [c.content for c in chunks]
        resp = self._client.rerank(
            query=query,
            documents=documents,
            model=self._model,
            top_k=min(top_k, len(documents)),
        )
        out: list[ChunkResult] = []
        for hit in resp.results:
            chunk = chunks[hit.index]
            chunk.score = float(hit.relevance_score)
            out.append(chunk)
        return out


def get_reranker() -> Reranker:
    settings = get_settings()
    provider = settings.reranker_provider
    if provider == "auto":
        if settings.has_cohere:
            provider = "cohere"
        elif settings.has_voyage:
            provider = "voyage"
        else:
            provider = "passthrough"

    try:
        if provider == "cohere" and settings.has_cohere:
            return CohereReranker(model=settings.reranker_model, api_key=settings.cohere_api_key)  # type: ignore[arg-type]
        if provider == "voyage" and settings.has_voyage:
            return VoyageReranker(model=settings.reranker_model, api_key=settings.voyage_api_key)  # type: ignore[arg-type]
    except ImportError:
        pass
    return PassthroughReranker()
