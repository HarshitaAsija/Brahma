-- Example schema for Brahma
-- This is illustrative; actual schema managed via Alembic migrations

CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT[],
    journal TEXT,
    publication_date DATE,
    doi VARCHAR(255) UNIQUE,
    url TEXT,
    embedding VECTOR(768), -- example dimension for BioBERT
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genes (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(100) UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    embedding VECTOR(768)
);

-- Add more tables as needed for proteins, diseases, drugs, etc.

-- Neo4j nodes and relationships are managed separately via the Neo4j database.