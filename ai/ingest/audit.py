"""Audit every data source in the PAA repository.

Walks the repo and catalogues XState machines, Gherkin features, json-rules-engine
rule files, markdown documentation, and database seed JSON. For each file records:
path, format, parseable status, content summary, and detected language.

Output is written as JSON. The downstream loader (ai.ingest.loader) reads the
audit report to know what to ingest and which files are broken.

Stdlib-only by design — runs without uv sync.

Usage:
    uv run python -m ai.ingest.audit --repo-root . --output ai/data/audit_report.json
    python3 -m ai.ingest.audit --repo-root . --output ai/data/audit_report.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

SUPPORTED_LANGUAGES = ("fr", "nl", "de", "en")

# Heuristics: directories under repo root we care about.
WORKFLOW_DIRS = ("src/workflows",)
RULES_DIRS = ("src/rules",)
FEATURE_DIRS = ("features",)
DOC_DIRS = ("docs", "docs-astro/src/content", "docs-astro/src/pages")
DB_DIRS = ("database",)

# Regex helpers — surface-level parsing, not a real TypeScript parser.
RE_CREATE_MACHINE = re.compile(r"\bcreateMachine\s*[<(]", re.MULTILINE)
RE_SETUP_MACHINE = re.compile(r"\bsetup\s*\(\s*\{", re.MULTILINE)
RE_STATE_KEY = re.compile(r"^\s*([a-zA-Z_][\w]*)\s*:\s*\{\s*$", re.MULTILINE)
RE_ADD_RULE = re.compile(r"\.addRule\s*\(", re.MULTILINE)
RE_NEW_ENGINE = re.compile(r"\bnew\s+Engine\s*\(", re.MULTILINE)
RE_MACHINE_ID = re.compile(r"id\s*:\s*['\"]([^'\"]+)['\"]")
RE_LANGUAGE_TAG = re.compile(r"^\s*#\s*language\s*:\s*([a-z]{2})", re.MULTILINE)
RE_GHERKIN_SCENARIO = re.compile(
    r"^\s*(Scenario|Scenario Outline|Scénario|Plan du scénario|Scenario:|Voorbeeld|Szenario)",
    re.MULTILINE | re.IGNORECASE,
)
RE_GHERKIN_FEATURE = re.compile(
    r"^\s*(Feature|Fonctionnalité|Functionaliteit|Funktionalität)\s*:",
    re.MULTILINE,
)


@dataclass
class FileEntry:
    path: str
    source_type: str
    format: str
    parseable: bool
    language: str | None
    summary: dict = field(default_factory=dict)
    error: str | None = None


@dataclass
class AuditReport:
    repo_root: str
    counts: dict
    by_source_type: dict
    files: list[FileEntry]
    unparseable: list[str]


def detect_language_from_path(path: Path) -> str | None:
    name = path.name.lower()
    for code in SUPPORTED_LANGUAGES:
        if name.endswith(f".{code}.ts") or name.endswith(f".{code}.json") or name.endswith(
            f".{code}.md"
        ):
            return code
    return None


def detect_language_from_content(text: str) -> str | None:
    m = RE_LANGUAGE_TAG.search(text)
    if m:
        return m.group(1).lower()
    sample = text[:4000].lower()
    fr_markers = ("fonctionnalité", "scénario", "étant donné", "et que", "alors")
    nl_markers = ("functionaliteit", "scenario", "gegeven", "wanneer", "dan")
    de_markers = ("funktionalität", "szenario", "angenommen", "wenn", "dann")
    fr_hits = sum(m in sample for m in fr_markers)
    nl_hits = sum(m in sample for m in nl_markers)
    de_hits = sum(m in sample for m in de_markers)
    best = max(("fr", fr_hits), ("nl", nl_hits), ("de", de_hits), key=lambda x: x[1])
    if best[1] >= 2:
        return best[0]
    return None


def audit_xstate_machine(path: Path) -> FileEntry:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return FileEntry(
            path=str(path),
            source_type="procedure",
            format="typescript",
            parseable=False,
            language=None,
            error=f"read_failed: {e}",
        )

    has_create_machine = bool(RE_CREATE_MACHINE.search(text))
    has_setup = bool(RE_SETUP_MACHINE.search(text))
    machine_id_match = RE_MACHINE_ID.search(text)

    if not (has_create_machine or has_setup):
        return FileEntry(
            path=str(path),
            source_type="procedure",
            format="typescript",
            parseable=False,
            language=detect_language_from_path(path),
            summary={"reason": "no createMachine() or setup() call found"},
            error="no_state_machine",
        )

    state_keys = RE_STATE_KEY.findall(text)
    likely_states = [
        s
        for s in state_keys
        if s
        not in {
            "context",
            "states",
            "on",
            "meta",
            "initial",
            "actions",
            "guards",
            "entry",
            "exit",
            "always",
            "after",
            "invoke",
            "target",
            "src",
        }
    ]

    return FileEntry(
        path=str(path),
        source_type="procedure",
        format="typescript",
        parseable=True,
        language=detect_language_from_path(path) or "fr",
        summary={
            "machine_id": machine_id_match.group(1) if machine_id_match else None,
            "candidate_state_count": len(set(likely_states)),
            "uses_setup": has_setup,
            "uses_create_machine": has_create_machine,
            "size_bytes": len(text),
        },
    )


def audit_rule_file(path: Path) -> FileEntry:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return FileEntry(
            path=str(path),
            source_type="rule",
            format="typescript",
            parseable=False,
            language=None,
            error=f"read_failed: {e}",
        )

    rule_count = len(RE_ADD_RULE.findall(text))
    has_engine = bool(RE_NEW_ENGINE.search(text))
    parseable = rule_count > 0 or has_engine

    return FileEntry(
        path=str(path),
        source_type="rule",
        format="typescript",
        parseable=parseable,
        language=detect_language_from_path(path) or "fr",
        summary={
            "rule_count": rule_count,
            "instantiates_engine": has_engine,
            "size_bytes": len(text),
        },
        error=None if parseable else "no_rules_found",
    )


def audit_gherkin_feature(path: Path) -> FileEntry:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return FileEntry(
            path=str(path),
            source_type="gherkin",
            format="gherkin",
            parseable=False,
            language=None,
            error=f"read_failed: {e}",
        )

    has_feature = bool(RE_GHERKIN_FEATURE.search(text))
    scenario_count = len(RE_GHERKIN_SCENARIO.findall(text))
    language = detect_language_from_content(text) or "fr"

    if not has_feature:
        return FileEntry(
            path=str(path),
            source_type="gherkin",
            format="gherkin",
            parseable=False,
            language=language,
            summary={"scenario_count": scenario_count},
            error="missing_feature_keyword",
        )

    return FileEntry(
        path=str(path),
        source_type="gherkin",
        format="gherkin",
        parseable=True,
        language=language,
        summary={
            "scenario_count": scenario_count,
            "size_bytes": len(text),
        },
    )


def audit_markdown(path: Path) -> FileEntry:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return FileEntry(
            path=str(path),
            source_type="doc",
            format="markdown",
            parseable=False,
            language=None,
            error=f"read_failed: {e}",
        )

    heading_count = sum(1 for line in text.splitlines() if line.lstrip().startswith("#"))
    return FileEntry(
        path=str(path),
        source_type="doc",
        format="markdown",
        parseable=True,
        language=detect_language_from_path(path) or detect_language_from_content(text) or "en",
        summary={
            "heading_count": heading_count,
            "size_bytes": len(text),
            "line_count": text.count("\n") + 1,
        },
    )


def audit_json_seed(path: Path) -> FileEntry:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return FileEntry(
            path=str(path),
            source_type="doc",
            format="json",
            parseable=False,
            language=None,
            error=f"read_failed: {e}",
        )
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return FileEntry(
            path=str(path),
            source_type="doc",
            format="json",
            parseable=False,
            language=None,
            summary={"size_bytes": len(text)},
            error=f"json_parse_error: {e.msg} at line {e.lineno}",
        )

    if isinstance(data, dict):
        keys = list(data.keys())
        summary = {"top_keys": keys[:20], "key_count": len(keys), "size_bytes": len(text)}
    elif isinstance(data, list):
        summary = {"top_keys": None, "list_length": len(data), "size_bytes": len(text)}
    else:
        summary = {"top_keys": None, "scalar_type": type(data).__name__, "size_bytes": len(text)}

    return FileEntry(
        path=str(path),
        source_type="doc",
        format="json",
        parseable=True,
        language=detect_language_from_path(path),
        summary=summary,
    )


def iter_files(root: Path, subdirs: tuple[str, ...], suffixes: tuple[str, ...]) -> list[Path]:
    found: list[Path] = []
    for sub in subdirs:
        base = root / sub
        if not base.exists():
            continue
        for suf in suffixes:
            found.extend(p for p in base.rglob(f"*{suf}") if p.is_file())
    return sorted(set(found))


def run_audit(repo_root: Path) -> AuditReport:
    files: list[FileEntry] = []

    for path in iter_files(repo_root, WORKFLOW_DIRS, (".ts",)):
        if path.name.endswith((".test.ts", ".spec.ts")) or path.name == "index.ts":
            continue
        files.append(audit_xstate_machine(path))

    for path in iter_files(repo_root, RULES_DIRS, (".ts",)):
        if path.name.endswith((".test.ts", ".spec.ts")) or path.name == "index.ts":
            continue
        files.append(audit_rule_file(path))

    for path in iter_files(repo_root, FEATURE_DIRS, (".feature",)):
        files.append(audit_gherkin_feature(path))

    for path in iter_files(repo_root, DOC_DIRS, (".md", ".mdx")):
        files.append(audit_markdown(path))

    for path in iter_files(repo_root, DB_DIRS, (".json",)):
        files.append(audit_json_seed(path))

    by_type: dict[str, dict] = {}
    for f in files:
        bucket = by_type.setdefault(
            f.source_type, {"total": 0, "parseable": 0, "unparseable": 0, "languages": {}}
        )
        bucket["total"] += 1
        bucket["parseable" if f.parseable else "unparseable"] += 1
        if f.language:
            bucket["languages"][f.language] = bucket["languages"].get(f.language, 0) + 1

    counts = {
        "total_files": len(files),
        "parseable": sum(1 for f in files if f.parseable),
        "unparseable": sum(1 for f in files if not f.parseable),
    }
    unparseable = [f.path for f in files if not f.parseable]

    return AuditReport(
        repo_root=str(repo_root.resolve()),
        counts=counts,
        by_source_type=by_type,
        files=files,
        unparseable=unparseable,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0] if __doc__ else None)
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path("."),
        help="PAA repository root (default: current directory)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("ai/data/audit_report.json"),
        help="Where to write the JSON report (default: ai/data/audit_report.json)",
    )
    args = parser.parse_args(argv)

    repo_root: Path = args.repo_root.resolve()
    if not repo_root.exists():
        print(f"error: repo root not found: {repo_root}", file=sys.stderr)
        return 2

    report = run_audit(repo_root)

    output_path: Path = args.output
    if not output_path.is_absolute():
        output_path = (Path.cwd() / output_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "repo_root": report.repo_root,
        "counts": report.counts,
        "by_source_type": report.by_source_type,
        "unparseable": report.unparseable,
        "files": [asdict(f) for f in report.files],
    }
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    print(f"Audit report written to {output_path}")
    print(f"  Total files:   {report.counts['total_files']}")
    print(f"  Parseable:     {report.counts['parseable']}")
    print(f"  Unparseable:   {report.counts['unparseable']}")
    print()
    print("By source type:")
    for stype, info in sorted(report.by_source_type.items()):
        print(
            f"  {stype:12s} total={info['total']:5d} "
            f"parseable={info['parseable']:5d} "
            f"unparseable={info['unparseable']:5d} "
            f"languages={info['languages']}"
        )
    if report.unparseable:
        print()
        print(f"Unparseable files ({len(report.unparseable)}):")
        for p in report.unparseable[:20]:
            print(f"  - {p}")
        if len(report.unparseable) > 20:
            print(f"  ... and {len(report.unparseable) - 20} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
