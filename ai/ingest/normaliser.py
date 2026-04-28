"""Unified Document schema for the PAA AI corpus.

A `Document` is the normalised representation of any data source in the PAA
repository — an XState procedure, a json-rules-engine rule set, a Gherkin
scenario, or a markdown doc. Loaders produce `Document` instances; the chunker
splits them into `Chunk` instances ready for embedding.

The schema is intentionally minimal: ID + textual content + structured metadata.
Anything richer (e.g. parsed XState states) lives in `metadata` so it stays
queryable in pgvector via JSONB but never escapes into the embedded text.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

SourceType = Literal["procedure", "rule", "gherkin", "doc"]
Language = Literal["fr", "nl", "de", "en"]


class Document(BaseModel):
    """One conceptual unit from the PAA corpus.

    `id` is globally unique across the corpus and stable across re-runs of the
    loaders, so chunks can be re-embedded incrementally.
    """

    id: str = Field(..., description="e.g. 'procedure:ris', 'rule:agr-eligible'")
    source_type: SourceType
    title: str
    content: str = Field(..., description="Plain-text representation for embedding")
    metadata: dict = Field(default_factory=dict)
    language: Language = "fr"
    source_path: str = Field(..., description="Original file path relative to repo root")


class Chunk(BaseModel):
    """A retrieval-sized slice of a `Document`.

    Each chunk carries its parent's metadata so retrieval results can cite the
    full Document without an extra join.
    """

    id: str = Field(..., description="e.g. 'procedure:ris#step-2'")
    document_id: str
    source_type: SourceType
    title: str
    content: str
    metadata: dict = Field(default_factory=dict)
    language: Language = "fr"
    source_path: str
    position: int = Field(0, description="Ordering within the parent Document")


def make_doc_id(source_type: SourceType, slug: str) -> str:
    return f"{source_type}:{slug}"


def make_chunk_id(document_id: str, position: int, suffix: str | None = None) -> str:
    if suffix:
        return f"{document_id}#{suffix}"
    return f"{document_id}#{position}"
