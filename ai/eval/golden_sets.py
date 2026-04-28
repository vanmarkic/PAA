"""Convert Gherkin scenarios into structured eval test cases.

Each `.feature` file may declare which rule/procedure it implements via header
comments (e.g. `# @implemented-by:src/rules/risRules.ts`). We use that to map
back to the corpus document ID, so retrieval correctness can be checked
automatically.

The Given/When/Then steps are parsed for facts and expected outcomes:
- `Given/Étant donné ... mon revenu mensuel est de 1200€` → fact extraction
- `Then/Alors je devrais être éligible`                  → expected_eligible=True
- `Then/Alors le montant ... 360€`                       → expected_amount=360
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from ai.ingest.loader import _gherkin_fallback, _gherkin_parser, _slug_from_filename

RE_IMPLEMENTED_BY = re.compile(r"@implemented-by\s*:\s*([\w/.\-]+)", re.IGNORECASE)
RE_LEGAL_BASIS = re.compile(r"@legal-basis\s*:\s*(.+)", re.IGNORECASE)
RE_AMOUNT = re.compile(r"(\d+(?:[.,]\d+)?)\s*€")
RE_AGE = re.compile(r"(\d+)\s*ans?\b", re.IGNORECASE)
RE_INCOME = re.compile(
    r"(?:revenu|salaire|montant)\D{0,40}?(\d+(?:[.,]\d+)?)\s*€",
    re.IGNORECASE,
)


@dataclass
class GoldenCase:
    case_id: str
    feature_file: str
    feature_title: str
    scenario_name: str
    query: str
    facts: dict = field(default_factory=dict)
    expected_eligible: bool | None = None
    expected_amount: float | None = None
    expected_doc_ids: list[str] = field(default_factory=list)
    legal_basis: str | None = None
    language: str = "fr"


def parse_features(repo_root: Path) -> list[GoldenCase]:
    base = repo_root / "features"
    if not base.exists():
        return []
    parse_gherkin = _gherkin_parser()
    cases: list[GoldenCase] = []
    for path in sorted(base.rglob("*.feature")):
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        feature_title = _feature_title(text) or path.stem
        implemented_by = _implemented_by(text)
        legal_basis = _legal_basis(text)
        try:
            scenarios = parse_gherkin(text)
        except Exception:
            # Some PAA feature files have step continuation lines that the
            # strict gherkin-official parser rejects. Fall back to the tolerant
            # scanner — slightly lossier but never blocks the eval pipeline.
            scenarios = _gherkin_fallback(text)
        for idx, sc in enumerate(scenarios, start=1):
            case = _scenario_to_case(
                feature_title=feature_title,
                feature_file=str(path.relative_to(repo_root)),
                idx=idx,
                sc=sc,
                slug=_slug_from_filename(path),
                implemented_by=implemented_by,
                legal_basis=legal_basis,
            )
            cases.append(case)
    return cases


def _feature_title(text: str) -> str | None:
    for line in text.splitlines():
        s = line.strip()
        for kw in ("Feature:", "Fonctionnalité:", "Functionaliteit:", "Funktionalität:"):
            if s.startswith(kw):
                return s[len(kw) :].strip()
    return None


def _implemented_by(text: str) -> str | None:
    m = RE_IMPLEMENTED_BY.search(text)
    return m.group(1).strip() if m else None


def _legal_basis(text: str) -> str | None:
    m = RE_LEGAL_BASIS.search(text)
    return m.group(1).strip() if m else None


def _scenario_to_case(
    *,
    feature_title: str,
    feature_file: str,
    idx: int,
    sc: dict,
    slug: str,
    implemented_by: str | None,
    legal_basis: str | None,
) -> GoldenCase:
    given_lines = []
    when_lines = []
    then_lines = []
    for step in sc.get("steps", []):
        kw = (step.get("keyword") or "").strip().lower()
        body = step.get("text", "").strip()
        if not body:
            continue
        if any(kw.startswith(p) for p in ("given", "étant", "et ", "and", "but", "mais", "gegeven", "angenommen")):
            given_lines.append(body)
        elif any(kw.startswith(p) for p in ("when", "quand", "als", "wenn")):
            when_lines.append(body)
        elif any(kw.startswith(p) for p in ("then", "alors", "dan", "dann")):
            then_lines.append(body)

    query = ". ".join(when_lines + given_lines).strip() or sc.get("name", "")
    expected_eligible = _extract_eligible(then_lines)
    expected_amount = _extract_amount(then_lines)
    facts = _extract_facts(given_lines)

    expected_doc_ids = [f"gherkin:{slug}#{idx}"]
    if implemented_by:
        # implemented_by like 'src/rules/risRules.ts' → 'rule:ris'
        leaf = Path(implemented_by).stem  # e.g. 'risRules'
        normalised = re.sub(r"(Rules|Machine)$", "", leaf, flags=re.IGNORECASE)
        normalised = re.sub(r"[^a-zA-Z0-9_-]+", "-", normalised).strip("-").lower()
        kind = "rule" if "rule" in implemented_by.lower() else "procedure"
        expected_doc_ids.append(f"{kind}:{normalised}")

    return GoldenCase(
        case_id=f"{slug}#{idx}",
        feature_file=feature_file,
        feature_title=feature_title,
        scenario_name=sc.get("name", ""),
        query=query,
        facts=facts,
        expected_eligible=expected_eligible,
        expected_amount=expected_amount,
        expected_doc_ids=expected_doc_ids,
        legal_basis=legal_basis,
    )


def _extract_eligible(lines: list[str]) -> bool | None:
    for line in lines:
        lc = line.lower()
        if "ne devrais pas être éligible" in lc or "n'est pas éligible" in lc:
            return False
        if "devrais être éligible" in lc or "est éligible" in lc:
            return True
    return None


def _extract_amount(lines: list[str]) -> float | None:
    for line in lines:
        if "montant" in line.lower():
            m = RE_AMOUNT.search(line)
            if m:
                return float(m.group(1).replace(",", "."))
    return None


def _extract_facts(given_lines: list[str]) -> dict:
    facts: dict = {}
    for line in given_lines:
        lc = line.lower()
        m = RE_AGE.search(lc)
        if m and "age" not in facts:
            facts["age"] = int(m.group(1))
        m = RE_INCOME.search(lc)
        if m and "monthlyIncome" not in facts:
            facts["monthlyIncome"] = float(m.group(1).replace(",", "."))
        if "isolé" in lc or "isolee" in lc or "isolée" in lc:
            facts.setdefault("category", "isole")
        if "cohabitant" in lc:
            facts.setdefault("category", "cohabitant")
        if "parent isolé" in lc or "monoparental" in lc:
            facts["category"] = "famille_monoparentale"
        if "belge" in lc:
            facts.setdefault("isBelgian", True)
        if "temps partiel" in lc or "part-time" in lc:
            facts.setdefault("employmentStatus", "part-time")
        if "temps plein" in lc or "full-time" in lc:
            facts.setdefault("employmentStatus", "full-time")
        if "maintien des droits" in lc:
            facts.setdefault("hasRightsMaintenance", True)
    return facts
