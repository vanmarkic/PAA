"""Loaders that turn PAA source files into normalised `Document` instances.

The TypeScript files in `src/workflows/` and `src/rules/` are not parsed via a
real TS AST — that would require a Node toolchain. Instead, this module uses
targeted regular expressions to extract the human-readable content that exists
inside those files: leading JSDoc comments, machine IDs, state names, `meta`
descriptions, rule events, and so on. This is lossy on edge cases but recovers
the vast majority of usable corpus text.

Gherkin files use the `gherkin-official` parser when available; fall back to
a tolerant regex scan otherwise so the loaders run in a stdlib-only env.

The CLI emits one JSON object per Document to `corpus.jsonl`:

    uv run python -m ai.ingest.loader --repo-root .. --output data/corpus.jsonl
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections.abc import Iterable
from pathlib import Path

from ai.ingest.normaliser import Document, make_doc_id

# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

WORKFLOW_DIR = "src/workflows"
RULES_DIR = "src/rules"
FEATURE_DIR = "features"
DOC_DIRS = ("docs", "docs-astro/src/content", "docs-astro/src/pages")


def _slug_from_filename(path: Path) -> str:
    name = path.stem
    name = re.sub(r"(Machine|Rules)$", "", name)
    name = re.sub(r"[^a-zA-Z0-9_-]+", "-", name)
    return name.strip("-").lower() or path.stem.lower()


def _rel(repo_root: Path, p: Path) -> str:
    try:
        return str(p.resolve().relative_to(repo_root.resolve()))
    except ValueError:
        return str(p)


def _detect_language(path: Path, text: str, default: str = "fr") -> str:
    """Best-effort detection.

    Suffix tags (e.g. `*.nl.ts`) win. Otherwise sniff Gherkin/Dutch/German
    keywords; fall back to `default`. Markdown defaults to English at the
    callsite; everything else defaults to French (the PAA codebase language).
    """
    name = path.name.lower()
    for code in ("fr", "nl", "de", "en"):
        if name.endswith((f".{code}.ts", f".{code}.json", f".{code}.md", f".{code}.feature")):
            return code
    sample = text[:4000].lower()
    fr = sum(m in sample for m in ("fonctionnalité", "scénario", "étant donné", "alors", "et que"))
    nl = sum(m in sample for m in ("functionaliteit", "scenario", "gegeven", "wanneer", "dan"))
    de = sum(m in sample for m in ("funktionalität", "szenario", "angenommen", "wenn", "dann"))
    best = max(("fr", fr), ("nl", nl), ("de", de), key=lambda x: x[1])
    if best[1] >= 2:
        return best[0]
    return default


# ---------------------------------------------------------------------------
# TypeScript surface-level extraction
# ---------------------------------------------------------------------------

RE_LEADING_JSDOC = re.compile(r"\A\s*/\*\*(.*?)\*/", re.DOTALL)
RE_MACHINE_ID = re.compile(r"\bid\s*:\s*['\"]([^'\"]+)['\"]")
RE_META_DESCRIPTION = re.compile(r"description\s*:\s*['\"]([^'\"]+)['\"]")
RE_STATE_NAME_KEY = re.compile(r"^(\s{4,12})([a-zA-Z_][\w]*)\s*:\s*\{\s*$", re.MULTILINE)
RE_EVENT_TYPE = re.compile(r"\bevent\s*:\s*\{\s*type\s*:\s*['\"]([^'\"]+)['\"]")
RE_FACT = re.compile(r"\bfact\s*:\s*['\"]([^'\"]+)['\"]")
RE_ON_TARGET = re.compile(
    r"\bon\s*:\s*\{[^}]*?([A-Z_]+)\s*:\s*['\"]?([a-zA-Z_][\w]*)['\"]?",
    re.DOTALL,
)


def _strip_jsdoc_text(raw: str) -> str:
    """Strip JSDoc markers (`* `, `*`, leading whitespace) and join paragraphs."""
    lines: list[str] = []
    for line in raw.splitlines():
        s = line.strip()
        if s.startswith("*"):
            s = s.lstrip("*").strip()
        if s:
            lines.append(s)
    return "\n".join(lines).strip()


def _extract_jsdoc(text: str) -> str:
    m = RE_LEADING_JSDOC.search(text)
    return _strip_jsdoc_text(m.group(1)) if m else ""


def _extract_state_names(text: str) -> list[str]:
    """Return likely XState state-key names (de-duplicated, in source order)."""
    seen: list[str] = []
    skip = {
        "context",
        "states",
        "on",
        "meta",
        "actions",
        "guards",
        "entry",
        "exit",
        "always",
        "after",
        "invoke",
        "target",
        "src",
        "params",
        "schemas",
        "types",
        "input",
        "output",
        "data",
        "events",
        "config",
    }
    for m in RE_STATE_NAME_KEY.finditer(text):
        name = m.group(2)
        if name in skip or name.startswith("_"):
            continue
        if name not in seen:
            seen.append(name)
    return seen


# ---------------------------------------------------------------------------
# Loader: XState machines (procedures)
# ---------------------------------------------------------------------------


def load_xstate_machines(repo_root: Path) -> list[Document]:
    base = repo_root / WORKFLOW_DIR
    if not base.exists():
        return []
    docs: list[Document] = []
    for path in sorted(base.rglob("*.ts")):
        if path.name in {"index.ts"} or path.name.endswith((".test.ts", ".spec.ts")):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        if "createMachine" not in text and "setup(" not in text:
            continue

        slug = _slug_from_filename(path)
        machine_id_match = RE_MACHINE_ID.search(text)
        machine_id = machine_id_match.group(1) if machine_id_match else slug
        jsdoc = _extract_jsdoc(text)
        states = _extract_state_names(text)
        descriptions = RE_META_DESCRIPTION.findall(text)
        events = list(dict.fromkeys(RE_EVENT_TYPE.findall(text)))
        language = _detect_language(path, text)

        title = (
            jsdoc.splitlines()[0] if jsdoc else machine_id.replace("-", " ").replace("_", " ")
        ).strip()[:140] or machine_id

        rendered = _render_procedure(
            machine_id=machine_id,
            title=title,
            jsdoc=jsdoc,
            states=states,
            descriptions=descriptions,
            events=events,
        )

        docs.append(
            Document(
                id=make_doc_id("procedure", slug),
                source_type="procedure",
                title=title,
                content=rendered,
                metadata={
                    "machine_id": machine_id,
                    "states": states,
                    "state_count": len(states),
                    "descriptions": descriptions,
                    "events": events,
                },
                language=language,  # type: ignore[arg-type]
                source_path=_rel(repo_root, path),
            )
        )
    return docs


def _render_procedure(
    *,
    machine_id: str,
    title: str,
    jsdoc: str,
    states: list[str],
    descriptions: list[str],
    events: list[str],
) -> str:
    parts = [f"Procédure: {title}.", f"Identifiant: {machine_id}."]
    if jsdoc:
        parts.append(f"Description:\n{jsdoc}")
    if states:
        parts.append("Étapes:")
        for i, s in enumerate(states, start=1):
            parts.append(f"  {i}. {s}")
    if descriptions:
        parts.append("Descriptions des états:")
        for d in descriptions:
            parts.append(f"  - {d}")
    if events:
        parts.append("Événements émis: " + ", ".join(events))
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Loader: rules (json-rules-engine)
# ---------------------------------------------------------------------------


def load_rules(repo_root: Path) -> list[Document]:
    base = repo_root / RULES_DIR
    if not base.exists():
        return []
    docs: list[Document] = []
    for path in sorted(base.rglob("*.ts")):
        if path.name == "index.ts" or path.name.endswith((".test.ts", ".spec.ts")):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        slug = _slug_from_filename(path)
        jsdoc = _extract_jsdoc(text)
        events = list(dict.fromkeys(RE_EVENT_TYPE.findall(text)))
        facts = list(dict.fromkeys(RE_FACT.findall(text)))
        rule_count = text.count(".addRule(")
        if rule_count == 0:
            continue
        language = _detect_language(path, text)

        title = (
            jsdoc.splitlines()[0] if jsdoc else slug.replace("-", " ").replace("_", " ")
        ).strip()[:140] or slug

        rendered = _render_rule(
            slug=slug,
            title=title,
            jsdoc=jsdoc,
            rule_count=rule_count,
            events=events,
            facts=facts,
        )

        docs.append(
            Document(
                id=make_doc_id("rule", slug),
                source_type="rule",
                title=title,
                content=rendered,
                metadata={
                    "rule_count": rule_count,
                    "events": events,
                    "facts": facts,
                },
                language=language,  # type: ignore[arg-type]
                source_path=_rel(repo_root, path),
            )
        )
    return docs


def _render_rule(
    *,
    slug: str,
    title: str,
    jsdoc: str,
    rule_count: int,
    events: list[str],
    facts: list[str],
) -> str:
    parts = [f"Règle d'éligibilité: {title}.", f"Identifiant: {slug}."]
    if jsdoc:
        parts.append(f"Description:\n{jsdoc}")
    parts.append(f"Nombre de règles définies: {rule_count}.")
    if events:
        parts.append("Événements possibles: " + ", ".join(events))
    if facts:
        parts.append("Faits utilisés: " + ", ".join(facts))
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Loader: Gherkin features
# ---------------------------------------------------------------------------


def load_gherkin_features(repo_root: Path) -> list[Document]:
    base = repo_root / FEATURE_DIR
    if not base.exists():
        return []
    paths = sorted(base.rglob("*.feature"))
    parser = _gherkin_parser()
    docs: list[Document] = []
    for path in paths:
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        try:
            scenarios = parser(text)
        except Exception:
            scenarios = _gherkin_fallback(text)
        feature_title = _gherkin_feature_title(text) or path.stem
        language = _detect_language(path, text)
        for idx, sc in enumerate(scenarios, start=1):
            slug = f"{_slug_from_filename(path)}#{idx}"
            content = _render_gherkin(feature_title, sc)
            docs.append(
                Document(
                    id=make_doc_id("gherkin", slug),
                    source_type="gherkin",
                    title=f"{feature_title} — {sc['name']}".strip(" —"),
                    content=content,
                    metadata={
                        "feature": feature_title,
                        "scenario_index": idx,
                        "scenario_name": sc["name"],
                        "tags": sc.get("tags", []),
                        "step_count": len(sc.get("steps", [])),
                    },
                    language=language,  # type: ignore[arg-type]
                    source_path=_rel(repo_root, path),
                )
            )
    return docs


def _gherkin_parser():
    """Return a parser callable that takes feature text and returns scenarios."""

    try:
        from gherkin.parser import Parser  # type: ignore

        parser = Parser()

        def parse(text: str) -> list[dict]:
            ast = parser.parse(text)
            feature = ast.get("feature") or {}
            scenarios: list[dict] = []
            for child in feature.get("children", []):
                sc = child.get("scenario")
                if not sc:
                    continue
                scenarios.append(
                    {
                        "name": sc.get("name", ""),
                        "tags": [t.get("name", "") for t in sc.get("tags", [])],
                        "steps": [
                            {
                                "keyword": (s.get("keyword") or "").strip(),
                                "text": s.get("text", ""),
                            }
                            for s in sc.get("steps", [])
                        ],
                    }
                )
            return scenarios

        return parse
    except Exception:
        return _gherkin_fallback


_RE_SCENARIO_LINE = re.compile(
    r"^\s*(Scenario Outline|Plan du scénario|Scenario|Scénario|Voorbeeld|Szenario)\s*:\s*(.*)$",
    re.MULTILINE,
)
_RE_FEATURE_LINE = re.compile(
    r"^\s*(Feature|Fonctionnalité|Functionaliteit|Funktionalität)\s*:\s*(.*)$",
    re.MULTILINE,
)
_RE_STEP = re.compile(
    r"^\s*(Given|When|Then|And|But|"
    r"Étant donné( que)?|Quand|Alors|Et|Mais|"
    r"Gegeven|Als|Dan|En|Maar|"
    r"Angenommen|Wenn|Dann|Und|Aber)\b\s*(.*)$",
    re.MULTILINE,
)


def _gherkin_feature_title(text: str) -> str | None:
    m = _RE_FEATURE_LINE.search(text)
    return m.group(2).strip() if m else None


def _gherkin_fallback(text: str) -> list[dict]:
    """Tolerant scanner for when gherkin-official is unavailable."""
    matches = list(_RE_SCENARIO_LINE.finditer(text))
    scenarios: list[dict] = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end]
        steps = [
            {
                "keyword": step.group(1).strip(),
                "text": step.group(3).strip(),
            }
            for step in _RE_STEP.finditer(body)
        ]
        scenarios.append({"name": m.group(2).strip(), "tags": [], "steps": steps})
    return scenarios


def _render_gherkin(feature_title: str, sc: dict) -> str:
    parts = [f"Fonctionnalité: {feature_title}.", f"Scénario: {sc['name']}."]
    if sc.get("tags"):
        parts.append("Tags: " + ", ".join(sc["tags"]))
    for step in sc.get("steps", []):
        kw = step.get("keyword", "").strip()
        body = step.get("text", "").strip()
        if kw or body:
            parts.append(f"  {kw} {body}".rstrip())
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Loader: markdown docs
# ---------------------------------------------------------------------------


def load_docs(repo_root: Path) -> list[Document]:
    docs: list[Document] = []
    for sub in DOC_DIRS:
        base = repo_root / sub
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.md")):
            try:
                text = path.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError):
                continue
            slug = _slug_from_filename(path)
            title = _markdown_title(text) or slug
            language = _detect_language(path, text, default="en")
            docs.append(
                Document(
                    id=make_doc_id("doc", slug),
                    source_type="doc",
                    title=title,
                    content=text,
                    metadata={
                        "size_bytes": len(text),
                        "line_count": text.count("\n") + 1,
                    },
                    language=language,  # type: ignore[arg-type]
                    source_path=_rel(repo_root, path),
                )
            )
    return docs


_RE_MD_TITLE = re.compile(r"^\s*#\s+(.*)$", re.MULTILINE)


def _markdown_title(text: str) -> str | None:
    m = _RE_MD_TITLE.search(text)
    return m.group(1).strip() if m else None


# ---------------------------------------------------------------------------
# Combined loader + CLI
# ---------------------------------------------------------------------------


def load_all(repo_root: Path) -> list[Document]:
    out: list[Document] = []
    out.extend(load_xstate_machines(repo_root))
    out.extend(load_rules(repo_root))
    out.extend(load_gherkin_features(repo_root))
    out.extend(load_docs(repo_root))
    # Stable sort for reproducible corpus.jsonl output
    out.sort(key=lambda d: d.id)
    return out


def write_jsonl(docs: Iterable[Document], output: Path) -> int:
    output.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with output.open("w", encoding="utf-8") as f:
        for d in docs:
            f.write(d.model_dump_json())
            f.write("\n")
            n += 1
    return n


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build the PAA corpus.jsonl from source files.")
    parser.add_argument("--repo-root", type=Path, default=Path("."))
    parser.add_argument("--output", type=Path, default=Path("data/corpus.jsonl"))
    args = parser.parse_args(argv)

    repo_root = args.repo_root.resolve()
    if not repo_root.exists():
        print(f"error: repo root not found: {repo_root}", file=sys.stderr)
        return 2

    docs = load_all(repo_root)
    output = args.output if args.output.is_absolute() else (Path.cwd() / args.output).resolve()
    n = write_jsonl(docs, output)

    by_type: dict[str, int] = {}
    for d in docs:
        by_type[d.source_type] = by_type.get(d.source_type, 0) + 1

    print(f"Wrote {n} documents to {output}")
    for st, cnt in sorted(by_type.items()):
        print(f"  {st:12s} {cnt:5d}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
