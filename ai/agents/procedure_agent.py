"""Procedure-walkthrough agent.

Given a procedure identifier, walks the user through the XState states one by
one, surfacing required documents and decision points. Currently a thin wrapper
around the procedure_lookup tools — it is intentionally simpler than the
eligibility agent because the procedure structure is already explicit.
"""

from __future__ import annotations

from dataclasses import dataclass

from ai.agents.tools.procedure_lookup import (
    get_procedure_steps,
    get_required_documents,
    search_procedures,
)


@dataclass
class ProcedureWalkthrough:
    procedure_id: str
    title: str
    steps: list[dict]
    required_documents: list[str]


def walkthrough(query_or_id: str) -> ProcedureWalkthrough | None:
    """Resolve a procedure (by ID or natural-language query) and return its plan."""
    if query_or_id.startswith("procedure:"):
        procedure_id = query_or_id
        title = query_or_id.split(":", 1)[1].replace("-", " ").title()
    else:
        candidates = search_procedures(query_or_id, top_k=1)
        if not candidates:
            return None
        procedure_id = candidates[0].id
        title = candidates[0].title

    steps = get_procedure_steps(procedure_id)
    documents = get_required_documents(procedure_id)
    return ProcedureWalkthrough(
        procedure_id=procedure_id,
        title=title,
        steps=steps,
        required_documents=documents,
    )
