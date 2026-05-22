"""Agent eval — does the agent's eligibility determination match the rules engine?

For each parseable Gherkin scenario, we feed the facts directly to the rules
bridge as ground truth, then ask the agent the natural-language question and
compare its tool_use call output. Exact match on `eligible: bool` and a
±EUR tolerance on `amount: float`.

In environments without an Anthropic key, the agent falls back to its stub
mode — this still exercises the eval pipeline but yields trivially empty
agent_decision values; the rules-engine ground truth is still recorded.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path

from ai.agents.eligibility_agent import EligibilityAgent
from ai.agents.tools.rules_engine import check_eligibility
from ai.eval.golden_sets import GoldenCase, parse_features

AMOUNT_TOLERANCE_EUR = 5.0


@dataclass
class AgentCaseResult:
    case_id: str
    query: str
    facts: dict
    expected_eligible: bool | None
    expected_amount: float | None
    rules_eligible: bool | None = None
    rules_amount: float | None = None
    rules_unavailable: bool = False
    agent_eligible: bool | None = None
    agent_amount: float | None = None
    agent_text: str = ""
    eligible_match: bool | None = None
    amount_match: bool | None = None


@dataclass
class AgentMetrics:
    total: int = 0
    cases_with_rules: int = 0
    eligible_exact_match_pct: float = 0.0
    amount_within_tolerance_pct: float = 0.0
    agent_called: int = 0
    notes: list[str] = field(default_factory=list)


def evaluate_case(case: GoldenCase, agent: EligibilityAgent | None) -> AgentCaseResult:
    benefit_type = _benefit_type_from_case(case)
    result = AgentCaseResult(
        case_id=case.case_id,
        query=case.query,
        facts=case.facts,
        expected_eligible=case.expected_eligible,
        expected_amount=case.expected_amount,
    )
    if benefit_type and case.facts:
        rules_out = check_eligibility(benefit_type, case.facts)
        result.rules_eligible = rules_out.eligible if not rules_out.unavailable else None
        result.rules_amount = rules_out.amount if not rules_out.unavailable else None
        result.rules_unavailable = rules_out.unavailable

    if agent is not None:
        agent_out = agent.run(case.query)
        result.agent_text = agent_out.final_text
        for inv in agent_out.tool_invocations:
            if inv.get("name") == "check_eligibility":
                output = inv.get("output", {})
                result.agent_eligible = output.get("eligible")
                result.agent_amount = output.get("amount")
                break

    if result.expected_eligible is not None and result.agent_eligible is not None:
        result.eligible_match = result.agent_eligible == result.expected_eligible
    if result.expected_amount is not None and result.agent_amount is not None:
        result.amount_match = (
            abs(result.agent_amount - result.expected_amount) <= AMOUNT_TOLERANCE_EUR
        )
    return result


def aggregate(results: list[AgentCaseResult]) -> AgentMetrics:
    if not results:
        return AgentMetrics()
    cases_with_rules = sum(1 for r in results if not r.rules_unavailable and r.rules_eligible is not None)
    agent_called = sum(1 for r in results if r.agent_eligible is not None)
    elig_judged = [r for r in results if r.eligible_match is not None]
    amt_judged = [r for r in results if r.amount_match is not None]
    elig_match = sum(1 for r in elig_judged if r.eligible_match)
    amt_match = sum(1 for r in amt_judged if r.amount_match)
    notes: list[str] = []
    if cases_with_rules == 0:
        notes.append(
            "Le moteur de règles TypeScript n'a pas pu être appelé (Node ou build manquants). "
            "Les vérités terrain ne sont pas disponibles dans cette exécution."
        )
    if agent_called == 0:
        notes.append("L'agent n'a pas appelé l'outil check_eligibility — pas de comparaison.")
    return AgentMetrics(
        total=len(results),
        cases_with_rules=cases_with_rules,
        eligible_exact_match_pct=(elig_match / len(elig_judged) * 100.0) if elig_judged else 0.0,
        amount_within_tolerance_pct=(amt_match / len(amt_judged) * 100.0) if amt_judged else 0.0,
        agent_called=agent_called,
        notes=notes,
    )


def _benefit_type_from_case(case: GoldenCase) -> str | None:
    for doc_id in case.expected_doc_ids:
        if doc_id.startswith("rule:"):
            return doc_id.split(":", 1)[1].split("-")[0]
    blob = (case.scenario_name + " " + case.query).lower()
    if "ris" in blob:
        return "ris"
    if "agr" in blob or "garantie de revenu" in blob:
        return "agr"
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Agent eval (agent vs rules engine).")
    parser.add_argument("--repo-root", type=Path, default=Path("."))
    parser.add_argument("--max-queries", type=int, default=50)
    parser.add_argument("--no-agent", action="store_true", help="Skip the agent — record rules-engine ground truth only.")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args(argv)

    cases = parse_features(args.repo_root.resolve())
    cases = [c for c in cases if c.facts and c.expected_eligible is not None]
    cases = cases[: args.max_queries]
    agent = None if args.no_agent else EligibilityAgent()

    results = [evaluate_case(c, agent) for c in cases]
    metrics = aggregate(results)

    output = args.output or _default_output("agent")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "kind": "agent",
                "timestamp": datetime.utcnow().isoformat(),
                "metrics": asdict(metrics),
                "results": [asdict(r) for r in results],
            },
            indent=2,
            ensure_ascii=False,
        )
    )

    print(f"Agent eval over {metrics.total} parseable cases:")
    print(f"  Cases with rules-engine ground truth: {metrics.cases_with_rules}")
    print(f"  Agent invoked check_eligibility: {metrics.agent_called}")
    print(f"  Eligibility exact match: {metrics.eligible_exact_match_pct:.1f}%")
    print(f"  Amount within ±{AMOUNT_TOLERANCE_EUR:.0f}€: {metrics.amount_within_tolerance_pct:.1f}%")
    for note in metrics.notes:
        print(f"  Note: {note}")
    print(f"  Report: {output}")
    return 0


def _default_output(kind: str) -> Path:
    here = Path(__file__).parent
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    return here / "results" / f"{kind}-{stamp}.json"


if __name__ == "__main__":
    raise SystemExit(main())
