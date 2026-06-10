-- BRAHMA v3.2 hardened schema (no redesign, only fixes)

-- Papers table (existing)
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    abstract TEXT
);

-- Central job system
CREATE TABLE pipeline_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    entity_ref_id UUID,
    paper_id UUID,
    status TEXT DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 5,
    priority INT DEFAULT 1,
    payload JSONB,
    locked_at TIMESTAMP,
    locked_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Idempotency deduplication keys
CREATE TABLE job_dedup_keys (
    idempotency_key TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dead letter queue for failed jobs
CREATE TABLE failed_jobs (
    job_id UUID,
    job_type TEXT,
    error_message TEXT,
    payload JSONB,
    failed_at TIMESTAMP DEFAULT NOW()
);

-- Embedding registry (optional safety table)
CREATE TABLE embedding_registry (
    model_name TEXT PRIMARY KEY,
    vector_dim INT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Pipeline events log
CREATE TABLE pipeline_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID,
    event_type TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
