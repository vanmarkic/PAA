# PAA AI Layer

Python-based AI layer for the Plateforme d'Aide Administrative. Adds RAG-based
question answering and agentic eligibility checking on top of the existing PAA
business logic.

## Setup

```bash
# Install dependencies (Voyage + Cohere SDKs are core deps)
uv sync

# To enable local embeddings (no API key, runs sentence-transformers on CPU/GPU):
uv sync --extra local

# To enable OpenAI embeddings:
uv sync --extra openai

# Copy environment template
cp .env.example .env
# Edit .env to add API keys
```

## Embedding providers

| Provider | Default model              | Native dim | Price ($/MTok) | Notes                                    |
|----------|----------------------------|------------|----------------|------------------------------------------|
| voyage   | `voyage-3-large`           | 1024       | 0.12           | **Recommended.** Anthropic-aligned.      |
| voyage   | `voyage-4-lite`            | 1024       | 0.02           | Cheap multilingual; same price as 3-small. |
| cohere   | `embed-multilingual-v3.0`  | 1024       | 0.10           | Already needed if using Cohere reranker. |
| openai   | `text-embedding-3-small`   | 1536→1024  | 0.02           | Truncated to 1024 via `dimensions=`.     |
| local    | `BAAI/bge-m3`              | 1024       | 0 (compute)    | ~2 GB download. CPU-friendly.            |
| stub     | hash-to-vec                | 1024       | 0              | Tests/CI only. Not for retrieval.        |

Set `EMBEDDING_PROVIDER=auto` (default) to pick the first available provider
in the order voyage → cohere → openai → local → stub.

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

See `ARCHITECTURE.md` for architecture diagrams and technical flow, and
`../README.md` for the full project context and roadmap.
