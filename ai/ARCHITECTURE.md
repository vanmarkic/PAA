# PAA AI Layer — Architecture & Technical Flow

This document describes the architecture of the PAA AI layer: a RAG-based
question-answering and agentic eligibility system built in Python on top of the
existing TypeScript PAA core (XState procedures + json-rules-engine).

The guiding principle: **the LLM handles language; deterministic code handles
truth.** Retrieval is grounded in the real corpus, and every eligibility number
comes from the json-rules-engine — never from the model.

---

## 1. System Architecture

All components and how they connect, from the PAA repo on the left to the
user-facing API on the right.

```mermaid
graph LR
    subgraph repo["PAA repository (source of truth)"]
        XS["src/workflows/<br/>135 XState machines"]
        RU["src/rules/<br/>358 rule files"]
        GH["features/<br/>240 Gherkin files"]
        DOC["docs/ + *.md"]
    end

    subgraph ingest["ai/ingest — Phase 0"]
        AUD["audit.py"]
        LOAD["loader.py"]
        CHUNK["chunker.py"]
        EMB["embedder.py"]
    end

    subgraph store["Storage"]
        PG[("PostgreSQL 16<br/>+ pgvector<br/>vector(1024) HNSW<br/>tsvector GIN")]
        RD[("Redis<br/>cache / queue")]
    end

    subgraph rag["ai/rag — Phase 1"]
        RET["retriever.py<br/>hybrid + RRF"]
        RER["reranker.py"]
        GEN["generator.py"]
    end

    subgraph agent["ai/agents — Phase 2"]
        ELA["eligibility_agent.py<br/>tool_use loop"]
        BR["bridges/rules_bridge.mjs"]
    end

    subgraph api["ai/api — FastAPI"]
        EP["/chat  /chat/stream<br/>/eligibility  /health"]
        GRD["GuardrailsMiddleware"]
    end

    subgraph ext["External providers"]
        VOY["Voyage / Cohere / OpenAI / local"]
        ANT["Anthropic Claude"]
    end

    XS --> AUD
    RU --> AUD
    GH --> AUD
    DOC --> AUD
    AUD --> LOAD --> CHUNK --> EMB
    EMB --> VOY
    EMB --> PG

    EP --> RET
    RET --> PG
    RET --> RER --> GEN
    GEN --> ANT
    RET -.query embed.-> VOY

    EP --> ELA
    ELA --> RET
    ELA --> BR
    BR --> RU
    ELA --> ANT

    EP --> GRD
    EP --> RD
    GRD --> USER([User / Frontend])
```

**Key boundaries**

- The **ingest pipeline** is offline/batch. It reads the repo, never the live API.
- **Storage** is the only stateful component. Postgres holds chunks + embeddings;
  Redis is optional cache.
- The **agent** never computes eligibility itself — it shells out to
  `rules_bridge.mjs`, which runs the *real* json-rules-engine.

---

## 2. Ingest Pipeline (Phase 0)

Turns 133+ heterogeneous procedure sources into embedded, searchable chunks.

```mermaid
flowchart TD
    START([repo root]) --> AUDIT["audit.py<br/>walk repo, catalogue ~840 files<br/>format / parseable / language"]
    AUDIT --> REPORT[/"data/audit_report.json"/]

    REPORT --> LOAD["loader.py"]
    LOAD --> L1["load_xstate_machines()<br/>regex → states, JSDoc, events<br/>→ French prose"]
    LOAD --> L2["load_rules()<br/>events, facts, addRule count"]
    LOAD --> L3["load_gherkin_features()<br/>gherkin-official + regex fallback"]
    LOAD --> L4["load_docs()<br/>markdown extraction"]
    L1 --> CORPUS
    L2 --> CORPUS
    L3 --> CORPUS
    L4 --> CORPUS[/"data/corpus.jsonl<br/>2,405 Documents"/]

    CORPUS --> CHUNK["chunker.py"]
    CHUNK --> C1["procedure → 1 chunk per state/step"]
    CHUNK --> C2["rule → 1 chunk per rule set (never split)"]
    CHUNK --> C3["gherkin → 1 chunk per scenario"]
    CHUNK --> C4["doc → heading split + sliding window<br/>target 350 / max 500 / overlap 50 tok"]
    C1 --> CHUNKS
    C2 --> CHUNKS
    C3 --> CHUNKS
    C4 --> CHUNKS[/"data/chunks.jsonl<br/>7,851 Chunks"/]

    CHUNKS --> EMBED["embedder.py<br/>input_type='document'"]
    EMBED --> UPSERT["upsert into Postgres<br/>embedding + tsvector('french')"]
    UPSERT --> DONE[("pgvector ready")]
```

**Why chunk by structure, not by token count?** A rule set is meaningless when
split — eligibility logic only makes sense whole. A procedure step is a natural
retrieval unit. Only free-form docs get the generic sliding-window treatment.

The `Document` → `Chunk` schema (`ingest/normaliser.py`):

```
Document(id="procedure:ris", source_type, title, content, metadata, language, source_path)
Chunk(id="procedure:ris#step-2", document_id, source_type, ..., position)
```

---

## 3. RAG Query Flow (Phase 1)

A grounded question-answer with hybrid retrieval and reranking.

```mermaid
sequenceDiagram
    participant U as User
    participant API as FastAPI /chat
    participant R as HybridRetriever
    participant E as Embedder
    participant DB as PostgreSQL
    participant RR as Reranker
    participant G as Generator (Claude)
    participant GM as GuardrailsMiddleware

    U->>API: question (FR)
    API->>R: search(query, top_k=20)
    R->>E: embed(query, input_type="query")
    E-->>R: query vector (1024d)

    par Semantic + Keyword (one round-trip each)
        R->>DB: pgvector cosine ORDER BY embedding <=> q
        DB-->>R: ranked chunk ids
    and
        R->>DB: tsvector @@ plainto_tsquery('french', q)
        DB-->>R: ranked chunk ids
    end

    R->>R: rrf_fuse(semantic, keyword, k=60)
    R->>RR: rerank(query, fused[:20])
    RR-->>R: top 5 by relevance
    R-->>API: 5 chunks + scores

    API->>G: generate(question, chunks)
    G->>G: French system prompt + context
    G-->>API: GeneratedAnswer(answer, sources, confidence)

    API->>GM: response
    GM->>GM: append CPAS disclaimer if missing
    GM-->>U: grounded answer + citations
```

**Reciprocal Rank Fusion** combines the two rankings without needing comparable
scores: `score(d) = Σ 1 / (k + rank_i(d))`, `k=60`. A chunk ranked high by
*either* method surfaces; a chunk ranked high by *both* dominates.

**Asymmetric retrieval matters.** Documents are embedded with
`input_type="document"` at ingest; queries with `input_type="query"` at search.
Voyage, Cohere, and e5-style models project these into aligned-but-distinct
spaces — mixing them silently degrades recall.

---

## 4. Agentic Eligibility Flow (Phase 2)

A multi-turn agent gathers facts conversationally, then delegates the actual
eligibility decision to the deterministic rules engine.

```mermaid
flowchart TD
    START([User: "Suis-je éligible au RIS ?"]) --> LOOP{tool_use loop<br/>max 8 turns}

    LOOP -->|Claude decides| T1["search_procedures<br/>→ HybridRetriever"]
    LOOP -->|Claude decides| T2["get_procedure_steps"]
    LOOP -->|Claude decides| T3["get_required_documents"]
    LOOP -->|Claude decides| T4["check_eligibility"]

    T1 --> FEED[tool_result back to Claude]
    T2 --> FEED
    T3 --> FEED

    T4 --> BRIDGE["rules_engine.py<br/>subprocess"]
    BRIDGE --> NODE["node bridges/rules_bridge.mjs<br/>loads dist/rules/*"]
    NODE --> JRE["json-rules-engine<br/>DETERMINISTIC evaluation"]
    JRE --> RESULT["EligibilityResult<br/>{eligible, amount, reasons}"]
    RESULT --> FEED

    FEED --> LOOP
    LOOP -->|no more tool calls| ANSWER([Final answer:<br/>conversational + exact numbers])

    NODE -.Node/bridge missing.-> UNAVAIL["unavailable=True<br/>agent says so honestly"]
    UNAVAIL --> FEED
```

**The responsibility split is absolute:**

| Concern | Owner | Why |
|---|---|---|
| Conversation, intent, follow-up questions | Claude (LLM) | Natural language is its strength |
| Which procedure applies | Retrieval (grounded) | Must be in the real corpus |
| Is the user eligible? How much? | json-rules-engine (Node) | Auditable, versioned, legally exact |

The LLM **never** produces a euro amount. If the Node bridge is unavailable, the
result carries `unavailable=True` and the agent says it cannot compute the
figure — it does not guess.

---

## 5. Provider Pluggability

Embedder, reranker, and LLM are all swappable behind a small factory. Selection
is resolved once in `config.py`.

```mermaid
flowchart TD
    subgraph emb["Embedder — get_embedder()"]
        EAUTO{EMBEDDING_PROVIDER}
        EAUTO -->|auto| ERES["resolve: voyage → cohere<br/>→ openai → local → stub"]
        EAUTO -->|explicit| EEXP[use named provider]
        ERES --> EPICK
        EEXP --> EPICK{provider}
        EPICK -->|voyage| V["VoyageEmbedder<br/>voyage-3-large · 1024d"]
        EPICK -->|cohere| C["CohereEmbedder<br/>embed-multilingual-v3.0"]
        EPICK -->|openai| O["OpenAIEmbedder<br/>3-small → 1024 via dimensions="]
        EPICK -->|local| L["LocalEmbedder<br/>BAAI/bge-m3 · CPU"]
        EPICK -->|stub| S["StubEmbedder<br/>deterministic hash · CI"]
    end

    subgraph rr["Reranker — get_reranker()"]
        RAUTO{RERANKER_PROVIDER}
        RAUTO -->|auto| RRES["cohere → voyage → passthrough"]
        RRES --> RPICK{available}
        RPICK -->|cohere| RC["CohereReranker rerank-v3.5"]
        RPICK -->|voyage| RV["VoyageReranker rerank-2"]
        RPICK -->|none| RP["PassthroughReranker<br/>keeps RRF order"]
    end

    subgraph llm["Generator — LLM"]
        LAUTO{LLM_PROVIDER}
        LAUTO -->|anthropic| LA["Claude Sonnet 4"]
        LAUTO -->|openai| LO["GPT-4o fallback"]
        LAUTO -->|stub| LS["Stub — echoes context, no API"]
    end
```

**Everything settles on 1024 dimensions** so the `vector(1024)` Postgres column
never needs migration: native for Voyage / Cohere / BGE-M3, truncated for OpenAI
via the `dimensions=` API parameter.

**Stub everywhere** means the whole pipeline — ingest, retrieval, eval — runs in
CI with zero API keys and zero network. Quality metrics are meaningless in stub
mode, but the pipeline *shape* and failure modes are fully exercised.

---

## 6. Evaluation Framework (Phase 3)

The existing Gherkin scenarios are the golden set — they already encode the
correct answers, validated by domain experts.

```mermaid
flowchart LR
    GH[/"features/*.feature<br/>240 Gherkin files"/] --> GS["golden_sets.py<br/>parse → GoldenCase<br/>extract facts, expected_eligible,<br/>expected_amount"]

    GS --> RE["retrieval_eval.py"]
    GS --> AE["agent_eval.py"]
    GS --> HC["hallucination_check.py"]

    subgraph retrieval["Retrieval eval"]
        RE --> RM["Precision@5 · Recall@5 · MRR<br/>did we retrieve the right chunk?"]
    end

    subgraph agentq["Agent correctness"]
        AE --> AM["exact match on 'eligible'<br/>±€5 on 'amount'<br/>vs json-rules-engine ground truth"]
    end

    subgraph faith["Faithfulness"]
        HC --> HM["LLM-as-judge (structured JSON)<br/>+ lexical Jaccard fallback<br/>is the answer grounded in sources?"]
    end

    RM --> CI{{"CI: every PR touching ai/"}}
    AM --> CI2{{"CI: main only — uses LLM + API keys"}}
    HM --> CI2
```

**Eval tiers map to CI cost:**

- **Retrieval eval** runs on every PR — offline, stub embedder, real Postgres.
  No API keys, so it is free and deterministic.
- **Agent eval + faithfulness** run on `main` only — they make real LLM calls
  and need secrets. Gated behind `github.ref == 'refs/heads/main'`.

---

## 7. Deployment Topology

```mermaid
flowchart TD
    subgraph local["Local development — docker-compose"]
        direction TB
        LPG[("pgvector/pgvector:pg16")]
        LRD[("redis:7-alpine")]
        LAI["ai-api container<br/>(profile: ai)"]
        LTOOLS["pgadmin · redis-commander<br/>(profile: tools)"]
        LAI --> LPG
        LAI --> LRD
    end

    subgraph cloud["Production — Render"]
        direction TB
        RNODE["PAA-web<br/>Node TS backend"]
        RAI["paa-ai-api<br/>Docker, ai/Dockerfile<br/>healthcheck /health"]
        RDB[("PAA-db — Render Postgres<br/>Node domain data only")]
    end

    subgraph supa["External vector DB"]
        SUPA[("Supabase / Neon Postgres<br/>pgvector included on free tier")]
    end

    RNODE --> RDB
    RAI -->|DATABASE_URL| SUPA
    RAI --> ANTH["Anthropic API"]
    RAI --> VOYP["Voyage API"]
```

**Why an external Postgres for the AI service?** Render's free Postgres does
**not** ship the `pgvector` extension. Supabase and Neon both include it on
their free tiers, so `DATABASE_URL` for `paa-ai-api` points there. Local Docker
uses the `pgvector/pgvector:pg16` image and works unchanged — the only
difference is the connection string.

---

## Component Reference

| Module | Responsibility | Phase |
|---|---|---|
| `ingest/audit.py` | Catalogue repo files (stdlib only) | 0 |
| `ingest/loader.py` | Source files → `corpus.jsonl` Documents | 0 |
| `ingest/chunker.py` | Documents → `chunks.jsonl` Chunks | 0 |
| `ingest/embedder.py` | Chunks → vectors, upsert to Postgres | 0 |
| `rag/retriever.py` | Hybrid search (pgvector + tsvector) + RRF | 1 |
| `rag/reranker.py` | Cross-encoder rerank, passthrough fallback | 1 |
| `rag/generator.py` | Grounded answer generation (Claude) | 1 |
| `agents/eligibility_agent.py` | Multi-turn `tool_use` loop | 2 |
| `agents/tools/rules_engine.py` | Subprocess bridge to json-rules-engine | 2 |
| `bridges/rules_bridge.mjs` | Node ESM — runs the real rules engine | 2 |
| `eval/golden_sets.py` | Gherkin → `GoldenCase` golden data | 3 |
| `eval/retrieval_eval.py` | Precision@k, Recall@k, MRR | 3 |
| `eval/agent_eval.py` | Agent output vs rules-engine ground truth | 3 |
| `eval/hallucination_check.py` | Faithfulness — LLM judge + lexical | 3 |
| `api/main.py` | FastAPI app, routes, guardrails | 1+ |
| `config.py` | Settings + provider resolution | all |

See [`README.md`](./README.md) for setup and [`../README.md`](../README.md)
for the full project roadmap.
