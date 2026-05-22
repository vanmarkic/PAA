"""Hybrid retriever — pgvector cosine + Postgres tsvector full-text, fused with RRF.

Reciprocal Rank Fusion (RRF) — score = Σ 1 / (k + rank). With k=60 (Cormack et
al., 2009) the fusion is robust to score-magnitude differences between vector
similarity and BM25/ts_rank, so we don't need to normalise either side.
"""

from __future__ import annotations

from dataclasses import dataclass

from ai.config import get_settings
from ai.ingest.embedder import EmbeddingProvider, get_embedder


@dataclass
class ChunkResult:
    id: str
    document_id: str
    source_type: str
    title: str
    content: str
    metadata: dict
    language: str
    source_path: str
    score: float
    rank_semantic: int | None = None
    rank_keyword: int | None = None


SEMANTIC_SQL = """
SELECT id, document_id, source_type, title, content, metadata, language, source_path,
       1 - (embedding <=> %s::vector) AS score
FROM chunks
WHERE embedding IS NOT NULL
ORDER BY embedding <=> %s::vector
LIMIT %s;
"""

# plainto_tsquery handles user-typed natural language — multi-word queries
# become an AND of stemmed tokens. ts_rank_cd weights term proximity.
KEYWORD_SQL = """
SELECT id, document_id, source_type, title, content, metadata, language, source_path,
       ts_rank_cd(tsv, query) AS score
FROM chunks, plainto_tsquery('french', %s) query
WHERE tsv @@ query
ORDER BY score DESC
LIMIT %s;
"""


def _vec_literal(vec: list[float]) -> str:
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


class HybridRetriever:
    def __init__(self, embedder: EmbeddingProvider | None = None) -> None:
        self._settings = get_settings()
        self._embedder = embedder or get_embedder()

    def search(self, query: str, top_k: int | None = None) -> list[ChunkResult]:
        from ai.db.connection import connect  # noqa: PLC0415  (lazy import for tests)

        top_k = top_k or self._settings.retriever_top_k
        # Use input_type="query" so providers that distinguish query vs document
        # embeddings (Voyage, Cohere, e5-style local models) align the spaces.
        query_vec = self._embedder.embed([query], input_type="query")[0]
        vec_literal = _vec_literal(query_vec)

        semantic: list[ChunkResult] = []
        keyword: list[ChunkResult] = []
        with connect() as conn, conn.cursor() as cur:
            cur.execute(SEMANTIC_SQL, (vec_literal, vec_literal, top_k))
            semantic = [self._row_to_result(row) for row in cur.fetchall()]
            cur.execute(KEYWORD_SQL, (query, top_k))
            keyword = [self._row_to_result(row) for row in cur.fetchall()]

        for i, r in enumerate(semantic):
            r.rank_semantic = i + 1
        for i, r in enumerate(keyword):
            r.rank_keyword = i + 1

        return self._fuse(semantic, keyword, top_k)

    def _fuse(
        self,
        semantic: list[ChunkResult],
        keyword: list[ChunkResult],
        top_k: int,
    ) -> list[ChunkResult]:
        k_rrf = self._settings.rrf_k
        by_id: dict[str, ChunkResult] = {}
        for rank, r in enumerate(semantic, start=1):
            r.score = 1.0 / (k_rrf + rank)
            by_id[r.id] = r
        for rank, r in enumerate(keyword, start=1):
            existing = by_id.get(r.id)
            if existing:
                existing.score += 1.0 / (k_rrf + rank)
                existing.rank_keyword = rank
            else:
                r.score = 1.0 / (k_rrf + rank)
                by_id[r.id] = r
        results = list(by_id.values())
        results.sort(key=lambda r: r.score, reverse=True)
        return results[:top_k]

    @staticmethod
    def _row_to_result(row: tuple) -> ChunkResult:
        (id_, document_id, source_type, title, content, metadata, language, source_path, score) = (
            row
        )
        return ChunkResult(
            id=id_,
            document_id=document_id,
            source_type=source_type,
            title=title,
            content=content,
            metadata=metadata if isinstance(metadata, dict) else {},
            language=language,
            source_path=source_path,
            score=float(score),
        )


def rrf_fuse(
    rankings: list[list[ChunkResult]],
    k: int = 60,
    top_k: int | None = None,
) -> list[ChunkResult]:
    """Public RRF helper — fuse N rankings of `ChunkResult`s into one ranking.

    Exposed separately so tests and the eval framework can verify fusion logic
    without standing up a database.
    """
    by_id: dict[str, ChunkResult] = {}
    for ranking in rankings:
        for rank, r in enumerate(ranking, start=1):
            existing = by_id.get(r.id)
            contrib = 1.0 / (k + rank)
            if existing is None:
                copy = ChunkResult(**{**r.__dict__, "score": contrib})
                by_id[r.id] = copy
            else:
                existing.score += contrib
    results = list(by_id.values())
    results.sort(key=lambda r: r.score, reverse=True)
    if top_k is not None:
        results = results[:top_k]
    return results
