# Plateforme d'Aide Administrative (PAA)

A platform encoding Belgian administrative procedures as executable state machines,
with a rules engine for eligibility determination and an AI-powered conversational
assistant.

- **133 procedures** modelled as XState state machines
- **1150 eligibility rules** evaluated via json-rules-engine
- **Gherkin specifications** as living documentation and test suites
- **AI layer** (in progress): RAG pipeline, agentic eligibility checker, evaluation framework

## Live Documentation

Interactive documentation for all procedures is available at:

**https://vanmarkic.github.io/PAA/**

- Browse Belgian administrative procedures
- Filter by category (e.g. `propriete-intellectuelle`, `etrangers`, `tax`)
- Interactive procedure visualization
- Search and comparison tools

## Architecture

PAA uses a **hybrid architecture** where each tool serves a specific purpose:

### 1. Gherkin/Cucumber — Eligibility Rules Specification

Human-readable specifications for eligibility criteria. Legal experts and social
workers can validate rules without reading code.

```gherkin
Scénario: Travailleur à temps partiel avec maintien des droits éligible
  Étant donné que je suis un travailleur à temps partiel
  Et que j'ai le maintien des droits
  Et que mon salaire brut mensuel est de 1200€
  Quand je vérifie mon éligibilité à l'AGR
  Alors je devrais être éligible
  Et le montant de l'allocation devrait être 360€
```

### 2. XState — Administrative Procedure State Machines

Visual, predictable orchestration of multi-step administrative procedures
(legal text simplification, application procedures). Each machine has explicit
states, guards, transitions, and meta descriptions.

```
idle → extractingStructure → identifyingConcepts → mappingVocabulary
  → generatingVersions → validating → completed
                              ↓ (if validation fails)
                        regeneratingWithConstraints ⟲
```

### 3. json-rules-engine — Runtime Eligibility Evaluation

Declarative rules stored as JSON, evaluated at runtime. Rules can be updated
without redeployment, versioned, and audited.

```typescript
{
  conditions: {
    all: [
      { fact: 'employmentStatus',     operator: 'equal',    value: 'part-time' },
      { fact: 'hasRightsMaintenance', operator: 'equal',    value: true },
      { fact: 'monthlySalaryGross',   operator: 'lessThan', value: 1650 },
    ],
  },
  event: { type: 'agr-eligible' },
}
```

### 4. TypeScript — Type-Safe Implementation

Compile-time safety for critical calculations (money, dates) and refactoring
confidence. All domain types live in `src/domain/types.ts`.

### Why this hybrid?

- **Gherkin** defines **what** the eligibility rules are (readable specs)
- **XState** defines **how** procedures flow (visual process automata)
- **json-rules-engine** defines **when** conditions apply (runtime evaluation)
- **TypeScript** provides **implementation** safety (compile-time guarantees)

## Project Structure

```
PAA/
├── features/              # Gherkin BDD scenarios (240 .feature files)
│   ├── benefits/          # AGR, RIS, allocations, etc.
│   ├── tax/               # Tax-related procedures
│   └── ...                # 13 other categories
│
├── src/
│   ├── domain/            # Pure domain models (types.ts, etc.)
│   ├── workflows/         # XState machines (135 procedures)
│   ├── rules/             # json-rules-engine rules (139 files)
│   ├── services/          # Orchestration layer
│   ├── api/               # Fastify HTTP layer (planned)
│   ├── database/          # TypeORM entities/migrations
│   ├── cache/             # Redis caching
│   ├── queue/             # Bull async jobs
│   └── examples/          # Runnable demos
│
├── ai/                    # AI layer (Python — see roadmap below)
│   ├── ingest/            # Phase 0: data normalisation
│   ├── rag/               # Phase 1: retrieval pipeline
│   ├── agents/            # Phase 2: agentic eligibility checker
│   ├── eval/              # Phase 3: evaluation framework
│   └── api/               # FastAPI service
│
├── database/              # Legal source registry, scrapings
├── docs/                  # Documentation
├── docs-astro/            # Astro static site for docs
└── frontend/              # React + Radix UI + Tailwind
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for PostgreSQL + Redis)
- Python 3.12+ and `uv` (for the AI layer)

### Backend

```bash
npm install
npm run docker:up          # Start PostgreSQL + Redis
npm run dev:api            # Start API server on http://localhost:3000
```

### Examples

```bash
npm run example:agr                # AGR eligibility check
npm run example:ris                # RIS eligibility check
npm run example:ris:workflow       # RIS procedure state machine
npm run example:conversion         # Legal text simplification pipeline
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                # Frontend on http://localhost:5173
```

### AI Layer

```bash
cd ai
uv sync                    # Install Python dependencies
uv run python -m ai.ingest.audit --repo-root .. --output data/audit_report.json
```

## Testing

```bash
npm test                           # Jest unit/integration tests
npm run test:coverage              # Coverage report
npm run cucumber                   # Cucumber/Gherkin BDD tests
npm run lint                       # ESLint
```

## AI Layer Roadmap

The AI layer adds RAG-based question answering and agentic eligibility checking
on top of the existing PAA business logic. It is built in Python alongside the
TypeScript core.

### Phase 0 — Data Normalisation

Audit and normalise the corpus: XState machines, Gherkin scenarios, rules,
documentation. Output a unified document schema ready for embedding.

### Phase 1 — RAG Pipeline

Hybrid retrieval (semantic + keyword) over Belgian administrative procedures.

- Embeddings: pluggable — Voyage AI (default), Cohere, OpenAI, or local
  Sentence-Transformers (`BAAI/bge-m3`). All settle on 1024 dim.
- Vector store: pgvector on PostgreSQL 16
- Keyword search: PostgreSQL `tsvector` with French stemming
- Re-ranker: Cohere `rerank-v3.5` or Voyage `rerank-2`
- Generation: Claude Sonnet 4 (primary), GPT-4o (fallback)

### Phase 2 — Agentic Eligibility Checker

A multi-turn agent that conversationally gathers user facts and delegates
eligibility calculation to the deterministic json-rules-engine. The LLM handles
conversation and reasoning; the rules engine handles calculation. They never
cross responsibilities.

### Phase 3 — Evaluation Framework

Quantitative regression testing using existing Gherkin scenarios as golden
sets:

- **Retrieval eval** — Precision@5, Recall@5, MRR
- **Agent correctness** — exact match against deterministic rules engine
- **Faithfulness** — LLM-as-judge or RAGAS faithfulness score

CI runs the eval suite on every PR touching `ai/`.

### Phase 4 — Frontend Integration

Chat panel in the existing React frontend. Streaming responses via SSE,
clickable source citations, eligibility result cards.

## Key Belgian Social Benefits

- **AGR** (Allocation de Garantie de Revenus) — Income guarantee for part-time workers
- **RIS** (Revenu d'Intégration Sociale) — Social integration income
- **CPAS** (Centre Public d'Action Sociale) — Public social welfare center

Benefits have complex eligibility rules based on employment status, income,
family situation, and residence. Rules change frequently and must be versioned
and auditable.

## Multi-Language Support

| Concept       | Technical Term | User-Facing (EN / FR / NL / DE)                           |
|---------------|----------------|-----------------------------------------------------------|
| Workflow      | workflow       | Procedures / Procédures / Procedures / Verfahren          |
| State Machine | state machine  | Process Automata / Automates de processus / ...           |
| Conversion    | conversion     | Simplification / Simplification / Vereenvoudiging / ...   |
| Business Rules| business rules | Eligibility Rules / Règles d'éligibilité / ...            |

See `docs/TERMINOLOGY_MAPPING.md` for the complete reference.

## Documentation

- `CONTRIBUTING.md` — Detailed contributor guide with code examples
- `QUICKSTART.md` — Getting started in 5 minutes
- `DIRECTORY_STRUCTURE.md` — Full project structure
- `CLAUDE.md` — Guidance for Claude Code working in this repo
- `docs/TERMINOLOGY_MAPPING.md` — User-facing terminology across languages

## License

ISC
