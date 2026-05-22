"""Tests for agent tools and the eligibility agent stub loop."""

from __future__ import annotations

from ai.agents.eligibility_agent import EligibilityAgent, _guess_benefit
from ai.agents.tools import eligibility_check
from ai.agents.tools.rules_engine import EligibilityResult, check_eligibility


def test_guess_benefit_detects_keywords():
    assert _guess_benefit("Je veux savoir si j'ai droit au RIS") == "ris"
    assert _guess_benefit("L'allocation de garantie de revenu") == "agr"
    assert _guess_benefit("Question vague sans benefit clair") is None


def test_required_facts_returns_schema():
    schema = eligibility_check.required_facts("agr")
    assert "monthlySalaryGross" in schema
    assert "employmentStatus" in schema


def test_evaluate_reports_missing_facts():
    result = eligibility_check.evaluate("ris", facts={"age": 30})
    assert result.unavailable
    assert "missing_facts" in (result.error or "")


def test_check_eligibility_unavailable_when_no_bridge(monkeypatch, tmp_path):
    """With no compiled rules build, the bridge should report unavailable cleanly."""
    # Force the bridge to fail by pointing PAA_REPO_ROOT at an empty dir.
    monkeypatch.setenv("PAA_REPO_ROOT", str(tmp_path))
    result = check_eligibility("agr", {"employmentStatus": "part-time"})
    assert isinstance(result, EligibilityResult)
    assert result.unavailable is True
    assert result.eligible is False


def test_eligibility_agent_stub_no_anthropic(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from ai.config import get_settings

    get_settings.cache_clear()
    agent = EligibilityAgent()
    result = agent.run("Je veux vérifier mon éligibilité au RIS.")
    assert "RIS" in result.final_text
    assert any(inv["name"] == "schema_lookup" for inv in result.tool_invocations)


def test_eligibility_agent_stub_no_benefit_match(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from ai.config import get_settings

    get_settings.cache_clear()
    agent = EligibilityAgent()
    result = agent.run("Question complètement hors sujet.")
    assert "RIS" in result.final_text or "AGR" in result.final_text
