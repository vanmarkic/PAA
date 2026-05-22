"""Embed chunks and upsert into the pgvector-backed `chunks` table.

Pluggable provider — choose via `EMBEDDING_PROVIDER`:

  voyage  Voyage AI (Anthropic-recommended). voyage-3-large default, 1024 dim.
  cohere  Cohere embed-multilingual-v3.0. 1024 dim, 100+ languages.
  openai  OpenAI text-embedding-3-small. Native 1536 dim, truncated to 1024
          via the `dimensions` parameter to match the schema.
  local   Sentence-Transformers (BAAI/bge-m3 default). Runs on CPU/GPU, no key.
  stub    Deterministic hash-to-vector. Used by tests/CI.
  auto    Pick the first available in the order above (default).

Voyage and Cohere distinguish document vs query embeddings via `input_type`;
the retriever passes `input_type="query"` so query/document semantic spaces
align — this is a measurable retrieval-quality win on those providers.

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
from typing import Literal, Protocol

from ai.config import get_settings
from ai.ingest.normaliser import Chunk

BATCH_SIZE = 64

InputType = Literal["document", "query"]


class EmbeddingProvider(Protocol):
    """Anything that turns a list of texts into a list of vectors of equal length."""

    name: str
    dim: int

    def embed(self, texts: list[str], input_type: InputType = "document") -> list[list[float]]: ...


# ---------------------------------------------------------------------------
# Stub — deterministic, no network
# ---------------------------------------------------------------------------


class StubEmbedder:
    """Hashes content to a unit-norm vector. Semantic similarity is meaningless,
    but the rest of the pipeline (DB upsert, vector type, retriever shape) is
    identical to production."""

    name = "stub"

    def __init__(self, dim: int = 1024) -> None:
        self.dim = dim

    def embed(
        self, texts: list[str], input_type: InputType = "document"
    ) -> list[list[float]]:
        return [self._hash_to_vector(t) for t in texts]

    def _hash_to_vector(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        repeats = math.ceil(self.dim / len(digest))
        raw = (digest * repeats)[: self.dim]
        v = [(b - 127.5) / 127.5 for b in raw]
        norm = math.sqrt(sum(x * x for x in v)) or 1.0
        return [x / norm for x in v]


# ---------------------------------------------------------------------------
# Voyage AI — Anthropic's recommended embedding partner
# ---------------------------------------------------------------------------


class VoyageEmbedder:
    name = "voyage"

    def __init__(self, model: str, dim: int, api_key: str) -> None:
        import voyageai  # type: ignore  # noqa: PLC0415

        self._client = voyageai.Client(api_key=api_key)
        self.model = model
        self.dim = dim

    def embed(
        self, texts: list[str], input_type: InputType = "document"
    ) -> list[list[float]]:
        # Voyage uses "document" / "query" for asymmetric retrieval. v4 family
        # supports a Matryoshka `output_dimension` parameter — pass `dim` so
        # the result matches the schema even if the model's native dim is larger.
        kwargs: dict = {"model": self.model, "input_type": input_type}
        try:
            resp = self._client.embed(texts, output_dimension=self.dim, **kwargs)
        except TypeError:
            # Older SDKs / non-Matryoshka models don't accept output_dimension.
            resp = self._client.embed(texts, **kwargs)
        return [list(v) for v in resp.embeddings]


# ---------------------------------------------------------------------------
# Cohere
# ---------------------------------------------------------------------------


class CohereEmbedder:
    name = "cohere"

    def __init__(self, model: str, dim: int, api_key: str) -> None:
        import cohere  # type: ignore  # noqa: PLC0415

        self._client = cohere.Client(api_key=api_key)
        self.model = model
        self.dim = dim

    def embed(
        self, texts: list[str], input_type: InputType = "document"
    ) -> list[list[float]]:
        # Cohere asks for "search_document" or "search_query" for retrieval.
        cohere_type = "search_query" if input_type == "query" else "search_document"
        resp = self._client.embed(
            texts=texts,
            model=self.model,
            input_type=cohere_type,
        )
        return [list(v) for v in resp.embeddings]


# ---------------------------------------------------------------------------
# OpenAI
# ---------------------------------------------------------------------------


class OpenAIEmbedder:
    name = "openai"

    def __init__(self, model: str, dim: int, api_key: str) -> None:
        from openai import OpenAI  # type: ignore  # noqa: PLC0415

        self._client = OpenAI(api_key=api_key)
        self.model = model
        self.dim = dim

    def embed(
        self, texts: list[str], input_type: InputType = "document"
    ) -> list[list[float]]:
        # text-embedding-3-* supports `dimensions` for truncation. Older models
        # ignore it, so we try with and without.
        try:
            resp = self._client.embeddings.create(
                model=self.model, input=texts, dimensions=self.dim
            )
        except TypeError:
            resp = self._client.embeddings.create(model=self.model, input=texts)
        return [list(item.embedding) for item in resp.data]


# ---------------------------------------------------------------------------
# Local (sentence-transformers)
# ---------------------------------------------------------------------------


class LocalEmbedder:
    """Runs a Sentence-Transformers model on CPU (or CUDA/MPS if available).

    Default model: `BAAI/bge-m3` — multilingual (100+ langs), 1024 dim, top of
    multilingual MTEB among open models. Override via LOCAL_EMBEDDING_MODEL.
    """

    name = "local"

    def __init__(self, model: str, dim: int) -> None:
        # Model loading (and the ~2 GB HuggingFace download for bge-m3) is
        # deferred to the first embed() call. Constructing the embedder must
        # stay cheap and offline so provider resolution and CLI startup never
        # touch the network.
        self.model = model
        self.dim = dim
        self._model = None

    def _ensure_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer  # type: ignore  # noqa: PLC0415

            self._model = SentenceTransformer(self.model)
            # Trust the model's reported dim; fall back to the configured one.
            try:
                native_dim = int(
                    self._model.get_sentence_embedding_dimension() or self.dim
                )
            except Exception:  # noqa: BLE001
                native_dim = self.dim
            if native_dim != self.dim:
                print(
                    f"[embedder] LocalEmbedder native dim={native_dim} differs from "
                    f"EMBEDDING_DIM={self.dim}. Using native dim. Update the schema "
                    "accordingly.",
                    file=sys.stderr,
                )
            self.dim = native_dim
        return self._model

    def embed(
        self, texts: list[str], input_type: InputType = "document"
    ) -> list[list[float]]:
        # bge-m3 and many e5-style models recommend a "query: " / "passage: "
        # prefix for asymmetric retrieval. Apply when the model name suggests it.
        model = self._ensure_model()
        prepared = self._maybe_prefix(texts, input_type)
        vectors = model.encode(
            prepared,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return [list(map(float, v)) for v in vectors]

    def _maybe_prefix(self, texts: list[str], input_type: InputType) -> list[str]:
        m = self.model.lower()
        if "e5" in m:
            tag = "query: " if input_type == "query" else "passage: "
            return [tag + t for t in texts]
        # bge-m3 doesn't require prefixes; other models can be added here.
        return texts


# ---------------------------------------------------------------------------
# Provider selection
# ---------------------------------------------------------------------------


def get_embedder() -> EmbeddingProvider:
    settings = get_settings()
    provider = settings.resolve_embedding_provider()
    model = settings.resolve_embedding_model(provider)
    dim = settings.embedding_dim

    if provider == "voyage":
        if not settings.has_voyage:
            raise ValueError("EMBEDDING_PROVIDER=voyage but VOYAGE_API_KEY is not set")
        return VoyageEmbedder(model=model, dim=dim, api_key=settings.voyage_api_key)  # type: ignore[arg-type]
    if provider == "cohere":
        if not settings.has_cohere:
            raise ValueError("EMBEDDING_PROVIDER=cohere but COHERE_API_KEY is not set")
        return CohereEmbedder(model=model, dim=dim, api_key=settings.cohere_api_key)  # type: ignore[arg-type]
    if provider == "openai":
        if not settings.has_openai:
            raise ValueError("EMBEDDING_PROVIDER=openai but OPENAI_API_KEY is not set")
        return OpenAIEmbedder(model=model, dim=dim, api_key=settings.openai_api_key)  # type: ignore[arg-type]
    if provider == "local":
        return LocalEmbedder(model=model, dim=dim)
    return StubEmbedder(dim=dim)


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
    print(f"Embedder: {embedder.name} dim={embedder.dim}")

    if args.dry_run:
        n = 0
        for batch in batched(_iter_chunks(chunks_path, args.limit), BATCH_SIZE):
            embedder.embed([c.content for c in batch], input_type="document")
            n += len(batch)
        print(f"Dry run complete: embedded {n} chunks (no DB upsert).")
        return 0

    from ai.db.connection import connect, ensure_schema  # noqa: PLC0415

    ensure_schema()

    n = 0
    with connect() as conn:
        with conn.cursor() as cur:
            for batch in batched(_iter_chunks(chunks_path, args.limit), BATCH_SIZE):
                vectors = embedder.embed([c.content for c in batch], input_type="document")
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
