-- PAA AI corpus schema (pgvector + tsvector for hybrid retrieval).
-- Run once against the target Postgres database before embedding.
--
-- Embedding dimension defaults to 1536 (OpenAI text-embedding-3-small).
-- If you change EMBEDDING_DIM in ai/config.py, recreate the table.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
    id              TEXT PRIMARY KEY,
    document_id     TEXT NOT NULL,
    source_type     TEXT NOT NULL,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    language        TEXT NOT NULL DEFAULT 'fr',
    source_path     TEXT NOT NULL,
    position        INTEGER NOT NULL DEFAULT 0,
    embedding       vector(1536),
    -- Use 'french' for French content; the retriever uses the same regconfig
    -- when calling to_tsquery so stemming matches.
    tsv             tsvector GENERATED ALWAYS AS (to_tsvector('french', content)) STORED,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON chunks (document_id);
CREATE INDEX IF NOT EXISTS chunks_source_type_idx ON chunks (source_type);
CREATE INDEX IF NOT EXISTS chunks_language_idx ON chunks (language);

-- HNSW for approximate nearest neighbour. cosine ops because we l2-normalise
-- embeddings client-side before insertion.
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx
    ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS chunks_tsv_idx ON chunks USING gin (tsv);

-- Update trigger so updated_at reflects re-embedding.
CREATE OR REPLACE FUNCTION chunks_set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chunks_set_updated_at ON chunks;
CREATE TRIGGER chunks_set_updated_at
    BEFORE UPDATE ON chunks
    FOR EACH ROW
    EXECUTE FUNCTION chunks_set_updated_at();
