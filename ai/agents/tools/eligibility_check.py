"""Convenience wrapper around the rules-engine bridge.

Centralises the canonical fact schema per benefit so the agent knows which
fields to ask the user for. Each entry maps a benefit type to the facts
required by the underlying rules engine.
"""

from __future__ import annotations

from ai.agents.tools.rules_engine import EligibilityResult, check_eligibility

# Minimal canonical fact schemas per benefit. Extend as more benefits are wired
# through the bridge. The agent reads this to know which facts to gather.
FACT_SCHEMAS: dict[str, dict[str, str]] = {
    "agr": {
        "employmentStatus": "Statut d'emploi (part-time | full-time | unemployed)",
        "hasRightsMaintenance": "Maintien des droits (true/false)",
        "monthlySalaryGross": "Salaire brut mensuel en EUR",
        "weeklyHours": "Nombre d'heures hebdomadaires",
    },
    "ris": {
        "age": "Âge en années",
        "category": "Catégorie (isole | cohabitant | famille_monoparentale)",
        "monthlyIncome": "Revenu mensuel en EUR",
        "householdIncome": "Revenu du ménage en EUR",
        "isBelgian": "Nationalité belge (true/false)",
        "hasChildren": "A des enfants à charge (true/false)",
    },
}


def required_facts(benefit_type: str) -> dict[str, str]:
    return FACT_SCHEMAS.get(benefit_type.lower(), {})


def missing_facts(benefit_type: str, facts: dict) -> list[str]:
    schema = required_facts(benefit_type)
    return [k for k in schema if k not in facts]


def evaluate(benefit_type: str, facts: dict) -> EligibilityResult:
    """Evaluate eligibility, surfacing missing facts as a clear error."""
    missing = missing_facts(benefit_type, facts)
    if missing:
        return EligibilityResult(
            benefit_type=benefit_type,
            eligible=False,
            amount=None,
            reason=f"Faits manquants: {', '.join(missing)}",
            rule_ids=[],
            facts_used=facts,
            unavailable=True,
            error=f"missing_facts:{','.join(missing)}",
        )
    return check_eligibility(benefit_type, facts)
