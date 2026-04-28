"""Chunk normalised `Document`s into retrieval-sized `Chunk`s.

Strategy by source type:
- procedure: one chunk per state/step (uses XState structure as natural boundary).
- rule:      one chunk per rule set — keep conditions + event together.
- gherkin:   one chunk per scenario — already right-sized (a scenario is small).
- doc:       split on H1/H2/H3 headings, with a soft cap of TARGET_TOKENS tokens
             and a small overlap to keep boundary context.

`tokens` is approximated by `len(text.split())` — character/word counts are within
~25% of true BPE tokens for FR/EN, plenty accurate for chunk-size budgeting.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections.abc import Iterable
from pathlib import Path

from ai.ingest.normaliser import Chunk, Document, make_chunk_id

TARGET_TOKENS = 350
MAX_TOKENS = 500
OVERLAP_TOKENS = 50

_RE_MD_HEADING = re.compile(r"^(#{1,3})\s+(.*)$")


def _wc(s: str) -> int:
    return len(s.split())


def chunk_procedure(doc: Document) -> list[Chunk]:
    """One chunk per state-step. Falls back to one chunk if no states recorded."""
    states: list[str] = doc.metadata.get("states", []) or []
    descriptions: list[str] = doc.metadata.get("descriptions", []) or []
    if not states:
        return [_single_chunk(doc)]

    chunks: list[Chunk] = []
    header = f"Procédure: {doc.title}.\nIdentifiant: {doc.metadata.get('machine_id', '')}."
    for i, state in enumerate(states):
        desc = descriptions[i] if i < len(descriptions) else ""
        body = f"{header}\nÉtape {i + 1}: {state}."
        if desc:
            body += f"\nDescription: {desc}"
        chunks.append(
            Chunk(
                id=make_chunk_id(doc.id, i, suffix=f"step-{i + 1}"),
                document_id=doc.id,
                source_type=doc.source_type,
                title=f"{doc.title} — étape {i + 1}: {state}",
                content=body,
                metadata={
                    **doc.metadata,
                    "step_index": i + 1,
                    "step_name": state,
                    "step_description": desc,
                },
                language=doc.language,
                source_path=doc.source_path,
                position=i,
            )
        )
    return chunks


def chunk_rule(doc: Document) -> list[Chunk]:
    """One chunk per rule Document — keep all conditions together."""
    return [_single_chunk(doc)]


def chunk_gherkin(doc: Document) -> list[Chunk]:
    """One chunk per Gherkin scenario — already right-sized."""
    return [_single_chunk(doc)]


def chunk_doc(doc: Document) -> list[Chunk]:
    """Split markdown on headings, with a soft size cap and overlap."""
    sections = _split_markdown_by_headings(doc.content)
    if not sections:
        return [_single_chunk(doc)]

    chunks: list[Chunk] = []
    pos = 0
    for heading, body in sections:
        # If a single section is over MAX_TOKENS, slide a window over it.
        if _wc(body) <= MAX_TOKENS:
            chunks.append(_make_doc_chunk(doc, heading, body, pos))
            pos += 1
        else:
            for part in _sliding_window(body, TARGET_TOKENS, OVERLAP_TOKENS):
                chunks.append(_make_doc_chunk(doc, heading, part, pos))
                pos += 1
    return chunks or [_single_chunk(doc)]


def _make_doc_chunk(doc: Document, heading: str, body: str, position: int) -> Chunk:
    title = f"{doc.title} — {heading}" if heading else doc.title
    return Chunk(
        id=make_chunk_id(doc.id, position),
        document_id=doc.id,
        source_type=doc.source_type,
        title=title,
        content=(f"# {heading}\n\n{body}" if heading else body).strip(),
        metadata={**doc.metadata, "heading": heading},
        language=doc.language,
        source_path=doc.source_path,
        position=position,
    )


def _split_markdown_by_headings(text: str) -> list[tuple[str, str]]:
    """Split markdown on top three heading levels; return (heading, body) pairs."""
    lines = text.splitlines()
    if not lines:
        return []
    sections: list[tuple[str, list[str]]] = []
    current_heading = ""
    current_body: list[str] = []
    for line in lines:
        m = _RE_MD_HEADING.match(line)
        if m:
            if current_body or current_heading:
                sections.append((current_heading, current_body))
            current_heading = m.group(2).strip()
            current_body = []
        else:
            current_body.append(line)
    if current_body or current_heading:
        sections.append((current_heading, current_body))
    return [(h, "\n".join(body).strip()) for h, body in sections if (h or "".join(body).strip())]


def _sliding_window(text: str, window: int, overlap: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    step = max(1, window - overlap)
    parts: list[str] = []
    for start in range(0, len(words), step):
        chunk = words[start : start + window]
        parts.append(" ".join(chunk))
        if start + window >= len(words):
            break
    return parts


def _single_chunk(doc: Document) -> Chunk:
    return Chunk(
        id=make_chunk_id(doc.id, 0),
        document_id=doc.id,
        source_type=doc.source_type,
        title=doc.title,
        content=doc.content,
        metadata=dict(doc.metadata),
        language=doc.language,
        source_path=doc.source_path,
        position=0,
    )


_DISPATCH = {
    "procedure": chunk_procedure,
    "rule": chunk_rule,
    "gherkin": chunk_gherkin,
    "doc": chunk_doc,
}


def chunk_document(doc: Document) -> list[Chunk]:
    return _DISPATCH.get(doc.source_type, lambda d: [_single_chunk(d)])(doc)


def chunk_corpus(docs: Iterable[Document]) -> list[Chunk]:
    out: list[Chunk] = []
    for d in docs:
        out.extend(chunk_document(d))
    return out


# ---------------------------------------------------------------------------
# CLI: stream chunks from corpus.jsonl to chunks.jsonl
# ---------------------------------------------------------------------------


def _read_corpus_jsonl(path: Path) -> Iterable[Document]:
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield Document.model_validate_json(line)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Chunk corpus.jsonl into chunks.jsonl.")
    parser.add_argument("--corpus", type=Path, default=Path("data/corpus.jsonl"))
    parser.add_argument("--output", type=Path, default=Path("data/chunks.jsonl"))
    args = parser.parse_args(argv)

    corpus_path = (
        args.corpus if args.corpus.is_absolute() else (Path.cwd() / args.corpus).resolve()
    )
    if not corpus_path.exists():
        print(f"error: corpus not found: {corpus_path}", file=sys.stderr)
        return 2
    output = args.output if args.output.is_absolute() else (Path.cwd() / args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    counts_by_type: dict[str, int] = {}
    n = 0
    with output.open("w", encoding="utf-8") as f:
        for doc in _read_corpus_jsonl(corpus_path):
            for ch in chunk_document(doc):
                f.write(ch.model_dump_json())
                f.write("\n")
                counts_by_type[ch.source_type] = counts_by_type.get(ch.source_type, 0) + 1
                n += 1

    print(f"Wrote {n} chunks to {output}")
    for st, c in sorted(counts_by_type.items()):
        print(f"  {st:12s} {c:5d}")

    # Surface chunk-size stats so we know if the soft caps are doing their job.
    sizes = []
    with output.open(encoding="utf-8") as f:
        for line in f:
            sizes.append(_wc(json.loads(line)["content"]))
    if sizes:
        sizes.sort()
        avg = sum(sizes) / len(sizes)
        p50 = sizes[len(sizes) // 2]
        p95 = sizes[int(len(sizes) * 0.95)]
        print(f"  size stats (words): mean={avg:.0f} p50={p50} p95={p95} max={sizes[-1]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
