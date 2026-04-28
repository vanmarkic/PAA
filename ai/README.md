# PAA AI Layer

Python-based AI layer for the Plateforme d'Aide Administrative. Adds RAG-based
question answering and agentic eligibility checking on top of the existing PAA
business logic.

## Setup

```bash
# Install dependencies
uv sync

# Copy environment template
cp .env.example .env
# Edit .env to add API keys
```

## Modules

| Module       | Purpose                                                  | Phase |
|--------------|----------------------------------------------------------|-------|
| `ingest/`    | Audit, load, normalise, chunk, embed the corpus          | 0     |
| `rag/`       | Hybrid retrieval, re-ranking, grounded generation        | 1     |
| `agents/`    | Multi-turn eligibility agent with deterministic tools    | 2     |
| `eval/`      | Retrieval, agent, and faithfulness evaluation            | 3     |
| `api/`       | FastAPI service exposing chat + eligibility endpoints    | 1+    |

## Common Commands

```bash
# Audit the PAA repo data sources
uv run python -m ai.ingest.audit --repo-root .. --output data/audit_report.json

# Build the corpus (after audit)
uv run python -m ai.ingest.loader --repo-root .. --output data/corpus.jsonl

# Embed and index
uv run python -m ai.ingest.embedder --corpus data/corpus.jsonl

# Run the API
uv run uvicorn ai.api.main:app --reload

# Tests
uv run pytest

# Lint
uv run ruff check .
```

See `../README.md` for the full project context and roadmap.
