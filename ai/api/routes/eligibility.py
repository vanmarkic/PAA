"""Direct eligibility check endpoint — bypasses the agent, calls the rules engine bridge."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.agents.tools.rules_engine import EligibilityResult, check_eligibility

router = APIRouter()


class EligibilityRequest(BaseModel):
    benefit_type: str = Field(..., description="e.g. 'agr', 'ris'")
    facts: dict = Field(default_factory=dict)


@router.post("/eligibility", response_model=EligibilityResult)
def eligibility(request: EligibilityRequest) -> EligibilityResult:
    try:
        return check_eligibility(request.benefit_type, request.facts)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
