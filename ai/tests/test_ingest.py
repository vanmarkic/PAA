"""Tests for the ingest pipeline (audit, normaliser, loader, chunker)."""

from __future__ import annotations

from pathlib import Path

from ai.ingest import audit, chunker, loader
from ai.ingest.normaliser import Chunk, Document

REPO_ROOT = Path(__file__).resolve().parents[2]


def test_audit_runs_against_repo(tmp_path):
    output = tmp_path / "audit.json"
    rc = audit.main(["--repo-root", str(REPO_ROOT), "--output", str(output)])
    assert rc == 0
    assert output.exists()
    import json

    data = json.loads(output.read_text())
    assert data["counts"]["total_files"] > 0
    # The repo should never have unparseable files at HEAD.
    assert data["counts"]["unparseable"] == 0


def test_loader_emits_documents():
    docs = loader.load_all(REPO_ROOT)
    assert len(docs) > 100, f"expected many docs, got {len(docs)}"
    types = {d.source_type for d in docs}
    assert {"procedure", "rule", "gherkin"}.issubset(types)
    for d in docs[:50]:
        assert d.id and d.title and d.content
        assert d.source_type in {"procedure", "rule", "gherkin", "doc"}


def test_chunker_handles_each_source_type():
    procedure = Document(
        id="procedure:test",
        source_type="procedure",
        title="Test procedure",
        content="ignored — chunker uses metadata.states",
        metadata={
            "machine_id": "test",
            "states": ["idle", "processing", "completed"],
            "descriptions": ["Idle state", "Doing work", "Done"],
        },
        language="fr",
        source_path="src/workflows/test.ts",
    )
    chunks = chunker.chunk_document(procedure)
    assert len(chunks) == 3
    assert all(isinstance(c, Chunk) for c in chunks)
    assert chunks[0].metadata["step_index"] == 1
    assert "idle" in chunks[0].content.lower()


def test_chunker_doc_splits_on_headings():
    doc = Document(
        id="doc:test",
        source_type="doc",
        title="Test doc",
        content="# Intro\n\nHello.\n\n## Details\n\nMore details here. " * 3,
        metadata={},
        language="en",
        source_path="docs/test.md",
    )
    chunks = chunker.chunk_document(doc)
    assert len(chunks) >= 2
    headings = [c.metadata.get("heading") for c in chunks]
    assert "Intro" in headings


def test_chunker_gherkin_one_per_doc():
    doc = Document(
        id="gherkin:test#1",
        source_type="gherkin",
        title="Test",
        content="Scénario: foo\n  Étant donné x\n  Alors y",
        metadata={"step_count": 2},
        language="fr",
        source_path="features/test.feature",
    )
    chunks = chunker.chunk_document(doc)
    assert len(chunks) == 1
    assert chunks[0].source_type == "gherkin"
