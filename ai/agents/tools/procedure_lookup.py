"""Tool: search procedures by semantic match.

Wraps the RAG retriever and filters to `source_type='procedure'`. Returns a
flat list of procedure summaries the agent can reference by ID.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ai.rag.retriever import HybridRetriever


class ProcedureSummary(BaseModel):
    id: str
    title: str
    machine_id: str | None = None
    state_count: int = 0
    score: float = 0.0
    source_path: str
    snippet: str = Field(default="", description="Short excerpt for previewing in chat")


def search_procedures(query: str, top_k: int = 3) -> list[ProcedureSummary]:
    retriever = HybridRetriever()
    candidates = retriever.search(query, top_k=top_k * 4)
    seen: set[str] = set()
    out: list[ProcedureSummary] = []
    for c in candidates:
        if c.source_type != "procedure":
            continue
        if c.document_id in seen:
            continue
        seen.add(c.document_id)
        out.append(
            ProcedureSummary(
                id=c.document_id,
                title=c.title,
                machine_id=c.metadata.get("machine_id"),
                state_count=int(c.metadata.get("state_count") or 0),
                score=c.score,
                source_path=c.source_path,
                snippet=c.content[:240],
            )
        )
        if len(out) >= top_k:
            break
    return out


def get_procedure_steps(procedure_id: str) -> list[dict]:
    """Return ordered steps for a procedure ID.

    Read from the corpus.jsonl rather than the live DB — keeps this tool fast
    and works in environments without Postgres. Falls back to an empty list
    if the corpus isn't available.
    """
    from pathlib import Path  # noqa: PLC0415

    from ai.ingest.normaliser import Document  # noqa: PLC0415

    candidates = [
        Path("data/corpus.jsonl"),
        Path("ai/data/corpus.jsonl"),
    ]
    for path in candidates:
        if not path.exists():
            continue
        with path.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                d = Document.model_validate_json(line)
                if d.id != procedure_id:
                    continue
                states = d.metadata.get("states") or []
                descriptions = d.metadata.get("descriptions") or []
                return [
                    {
                        "index": i + 1,
                        "name": state,
                        "description": descriptions[i] if i < len(descriptions) else "",
                    }
                    for i, state in enumerate(states)
                ]
    return []


def get_required_documents(procedure_id: str) -> list[str]:
    """Best-effort extraction of required documents from procedure metadata.

    Concrete extraction of "required documents" from the XState machines is
    procedure-specific (no universal field). For now we return the descriptions
    that mention 'document', 'pièce', or 'justificatif' — a useful signal until
    the procedure metadata is enriched.
    """
    needles = ("document", "pièce", "piece", "justificatif", "attestation", "certificat")
    out: list[str] = []
    for step in get_procedure_steps(procedure_id):
        desc = (step.get("description") or "").lower()
        if any(n in desc for n in needles):
            out.append(step["description"])
    return out
