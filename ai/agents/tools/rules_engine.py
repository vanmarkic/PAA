"""Bridge from Python to the existing TypeScript json-rules-engine layer.

Strategy: spawn `node` running `bridges/rules_bridge.mjs` with a JSON payload on
stdin. The Node script imports the compiled rules from `dist/` (or via ts-node)
and emits a JSON response on stdout. This avoids reimplementing rule evaluation
in Python and keeps the canonical rule logic in one place.

If Node or the bridge script are unavailable (e.g. CI without Node, or the
PAA build is missing) the function returns a clearly-labelled
`unavailable=True` result so the agent loop can degrade gracefully.

For full HTTP-based bridging, point `RULES_ENGINE_URL` at a small Fastify
endpoint inside the PAA backend that wraps the same call.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

from pydantic import BaseModel, Field

BRIDGE_REL_PATH = "ai/bridges/rules_bridge.mjs"
BRIDGE_TIMEOUT_SECONDS = 15


class EligibilityResult(BaseModel):
    benefit_type: str
    eligible: bool
    amount: float | None = None
    currency: str = "EUR"
    reason: str = ""
    rule_ids: list[str] = Field(default_factory=list)
    facts_used: dict = Field(default_factory=dict)
    unavailable: bool = False
    error: str | None = None


def check_eligibility(benefit_type: str, facts: dict) -> EligibilityResult:
    """Evaluate eligibility deterministically. Never hits an LLM."""
    if not benefit_type:
        raise ValueError("benefit_type is required")

    repo_root = _find_repo_root()
    if repo_root is None:
        return _unavailable(benefit_type, facts, "repo root not located")

    bridge = repo_root / BRIDGE_REL_PATH
    node = shutil.which("node")
    if node is None or not bridge.exists():
        return _unavailable(
            benefit_type,
            facts,
            f"node available={node is not None}, bridge present={bridge.exists()}",
        )

    payload = json.dumps({"benefitType": benefit_type, "facts": facts})
    try:
        proc = subprocess.run(
            [node, str(bridge)],
            input=payload,
            capture_output=True,
            text=True,
            timeout=BRIDGE_TIMEOUT_SECONDS,
            cwd=str(repo_root),
            check=False,
        )
    except subprocess.TimeoutExpired:
        return _unavailable(benefit_type, facts, "bridge timeout")

    if proc.returncode != 0:
        return _unavailable(
            benefit_type, facts, f"bridge exit {proc.returncode}: {proc.stderr.strip()[:300]}"
        )

    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        return _unavailable(benefit_type, facts, f"bridge returned non-JSON: {e}")

    return EligibilityResult(
        benefit_type=benefit_type,
        eligible=bool(data.get("eligible", False)),
        amount=data.get("amount"),
        currency=data.get("currency", "EUR"),
        reason=data.get("reason", ""),
        rule_ids=list(data.get("ruleIds", []) or data.get("rule_ids", [])),
        facts_used=facts,
        unavailable=False,
    )


def _find_repo_root() -> Path | None:
    explicit = os.environ.get("PAA_REPO_ROOT")
    if explicit:
        p = Path(explicit).resolve()
        return p if p.exists() else None
    here = Path(__file__).resolve()
    for parent in [here, *here.parents]:
        if (parent / "package.json").exists() and (parent / "src" / "rules").exists():
            return parent
    return None


def _unavailable(benefit_type: str, facts: dict, error: str) -> EligibilityResult:
    return EligibilityResult(
        benefit_type=benefit_type,
        eligible=False,
        amount=None,
        reason=(
            "Le moteur de règles n'est pas disponible dans cet environnement. "
            "Aucune décision déterministe n'a été calculée."
        ),
        rule_ids=[],
        facts_used=facts,
        unavailable=True,
        error=error,
    )
