"""Embed chunks and upsert into the pgvector-backed `chunks` table.

By default uses OpenAI's `text-embedding-3-small` (1536 dim). When
`OPENAI_API_KEY` is unset the embedder falls back to a deterministic stub
provider that hashes the chunk content into a unit-norm vector — useful for
tests and CI without burning real API credits. The retriever code is identical
in both modes.

Usage:
    uv run python -m ai.ingest.embedder --chunks data/chunks.jsonl
    uv run python -m ai.ingest.embedder --chunks data/chunks.jsonl --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from collections.abc import Iterable, Iterator
from pathlib import Path
from typing import Protocol

from ai.config import get_settings
from ai.ingest.normaliser import Chunk

BATCH_SIZE = 64


class EmbeddingProvider(Protocol):
    """Anything that turns a list of texts into a list of vectors of equal length."""

    dim: int

    def embed(self, texts: list[str]) -> list[list[float]]: ...


class StubEmbedder:
    """Deterministic embedder. Hashes content to a unit-norm vector.

    Used when no API key is configured (tests, CI, offline dev). It is NOT a
    real embedding model — semantic similarity is meaningless. But the code path
    (DB upsert, vector type, retriever shape) is identical to production.
    """

    def __init__(self, dim: int = 1536) -> None:
        self.dim = dim

    def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._hash_to_vector(t) for t in texts]

    def _hash_to_vector(self, text: str) -> list[float]:
        # SHA-256 (32 bytes) → tile/truncate to dim, normalise to unit length.
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        repeats = math.ceil(self.dim / len(digest))
        raw = (digest * repeats)[: self.dim]
        # Map bytes 0..255 → -1..+1, then l2-normalise.
        v = [(b - 127.5) / 127.5 for b in raw]
        norm = math.sqrt(sum(x * x for x in v)) or 1.0
        return [x / norm for x in v]


class OpenAIEmbedder:
    """Calls OpenAI's embeddings endpoint. Lazy import so tests don't need the SDK."""

    def __init__(self, model: str, dim: int, api_key: str) -> None:
        from openai import OpenAI  # type: ignore

        self._client = OpenAI(api_key=api_key)
        self.model = model
        self.dim = dim

    def embed(self, texts: list[str]) -> list[list[float]]:
        resp = self._client.embeddings.create(model=self.model, input=texts)
        return [item.embedding for item in resp.data]


def get_embedder() -> EmbeddingProvider:
    settings = get_settings()
    if settings.has_openai:
        return OpenAIEmbedder(
            model=settings.embedding_model,
            dim=settings.embedding_dim,
            api_key=settings.openai_api_key,  # type: ignore[arg-type]
        )
    return StubEmbedder(dim=settings.embedding_dim)


# ---------------------------------------------------------------------------
# Chunk I/O
# ---------------------------------------------------------------------------


def read_chunks_jsonl(path: Path) -> Iterator[Chunk]:
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield Chunk.model_validate_json(line)


def batched(iterable: Iterable[Chunk], n: int) -> Iterator[list[Chunk]]:
    batch: list[Chunk] = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= n:
            yield batch
            batch = []
    if batch:
        yield batch


# ---------------------------------------------------------------------------
# Upsert into pgvector
# ---------------------------------------------------------------------------


UPSERT_SQL = """
INSERT INTO chunks (
    id, document_id, source_type, title, content, metadata,
    language, source_path, position, embedding
)
VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    document_id = EXCLUDED.document_id,
    source_type = EXCLUDED.source_type,
    title       = EXCLUDED.title,
    content     = EXCLUDED.content,
    metadata    = EXCLUDED.metadata,
    language    = EXCLUDED.language,
    source_path = EXCLUDED.source_path,
    position    = EXCLUDED.position,
    embedding   = EXCLUDED.embedding;
"""


def _vec_literal(vec: list[float]) -> str:
    """pgvector accepts text literals in '[v1,v2,...]' form."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def upsert_batch(cur, chunks: list[Chunk], vectors: list[list[float]]) -> None:
    rows = [
        (
            c.id,
            c.document_id,
            c.source_type,
            c.title,
            c.content,
            json.dumps(c.metadata, ensure_ascii=False),
            c.language,
            c.source_path,
            c.position,
            _vec_literal(v),
        )
        for c, v in zip(chunks, vectors, strict=True)
    ]
    cur.executemany(UPSERT_SQL, rows)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Embed chunks.jsonl and upsert into pgvector.")
    parser.add_argument("--chunks", type=Path, default=Path("data/chunks.jsonl"))
    parser.add_argument("--corpus", type=Path, default=None, help="(legacy alias for --chunks)")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Embed but skip the DB upsert. Reports counts only.",
    )
    parser.add_argument(
        "--limit", type=int, default=None, help="Process at most N chunks (debugging)."
    )
    args = parser.parse_args(argv)

    chunks_path = args.corpus or args.chunks
    chunks_path = (
        chunks_path if chunks_path.is_absolute() else (Path.cwd() / chunks_path).resolve()
    )
    if not chunks_path.exists():
        print(f"error: chunks file not found: {chunks_path}", file=sys.stderr)
        return 2

    embedder = get_embedder()
    print(f"Embedder: {type(embedder).__name__}, dim={embedder.dim}")

    if args.dry_run:
        n = 0
        for batch in batched(_iter_chunks(chunks_path, args.limit), BATCH_SIZE):
            embedder.embed([c.content for c in batch])
            n += len(batch)
        print(f"Dry run complete: embedded {n} chunks (no DB upsert).")
        return 0

    from ai.db.connection import connect, ensure_schema  # noqa: PLC0415

    ensure_schema()

    n = 0
    with connect() as conn:
        with conn.cursor() as cur:
            for batch in batched(_iter_chunks(chunks_path, args.limit), BATCH_SIZE):
                vectors = embedder.embed([c.content for c in batch])
                upsert_batch(cur, batch, vectors)
                n += len(batch)
                if n % (BATCH_SIZE * 10) == 0:
                    print(f"  upserted {n} chunks...")
        conn.commit()
    print(f"Done: upserted {n} chunks into pgvector.")
    return 0


def _iter_chunks(path: Path, limit: int | None) -> Iterator[Chunk]:
    for i, c in enumerate(read_chunks_jsonl(path)):
        if limit is not None and i >= limit:
            return
        yield c


if __name__ == "__main__":
    raise SystemExit(main())
