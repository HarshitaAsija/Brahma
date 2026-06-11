-- BRAHMA v3.2 hardened schema (no redesign, only fixes)
CREATE EXTENSION IF NOT EXISTS vector;

-- L0 — RAW INGESTION LAYER
-- Table: raw_papers – immutable raw scientific documents as audit log
CREATE TABLE raw_papers (
    raw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_hash TEXT UNIQUE NOT NULL,
    raw_title TEXT NOT NULL,
    abstract TEXT,
    full_text TEXT,
    source TEXT NOT NULL,
    source_external_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    doi TEXT,
    pmid TEXT,
    authors JSONB,
    journal TEXT,
    publication_date DATE,
    keywords JSONB,
    mesh_terms JSONB,
    article_type TEXT,
    language TEXT,
    fetch_timestamp TIMESTAMP NOT NULL,
    ingestion_timestamp TIMESTAMP DEFAULT NOW(),
    scraper_version TEXT NOT NULL,
    pipeline_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- L1 — CANONICAL PAPER LAYER
-- Table: papers – deduplicated, normalized scientific paper records
CREATE TABLE papers (
    paper_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doi TEXT UNIQUE,
    pmid TEXT UNIQUE,
    ingestion_hash TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    journal TEXT NOT NULL,
    publication_date DATE NOT NULL,
    article_type TEXT NOT NULL,
    language TEXT NOT NULL,
    open_access BOOLEAN NOT NULL DEFAULT FALSE,
    retracted BOOLEAN NOT NULL DEFAULT FALSE,
    retraction_reason TEXT,
    source TEXT NOT NULL,
    source_external_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: paper_text_sections – structured decomposition of full‑text papers
CREATE TABLE paper_text_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id),
    introduction TEXT NOT NULL,
    methods TEXT NOT NULL,
    results TEXT NOT NULL,
    discussion TEXT NOT NULL,
    conclusion TEXT NOT NULL
);

-- Table: paper_source_map – traceability between raw and canonical papers
CREATE TABLE paper_source_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id),
    raw_id UUID REFERENCES raw_papers(raw_id)
);

-- L1.5 — CHUNKING LAYER
-- Table: paper_chunks – semantic chunks of paper text for embeddings
CREATE TABLE paper_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id),
    section TEXT NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    embedding_model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- L2 — STUDY METADATA LAYER
-- Table: study_metadata – extracted clinical and experimental attributes
CREATE TABLE study_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID UNIQUE REFERENCES papers(paper_id),
    study_type TEXT NOT NULL,
    population TEXT NOT NULL,
    sample_size INT NOT NULL,
    age_min INT,
    age_max INT,
    gender_male_percentage FLOAT,
    gender_female_percentage FLOAT,
    inclusion_criteria JSONB NOT NULL,
    exclusion_criteria JSONB NOT NULL,
    primary_outcomes JSONB NOT NULL,
    secondary_outcomes JSONB,
    statistical_methods JSONB NOT NULL,
    confounders JSONB,
    limitations TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    model_version TEXT NOT NULL
);

-- L2 — ENTITY SYSTEM
-- Table: entities – canonical biomedical entities used in the knowledge graph
CREATE TABLE entities (
    entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    embedding_model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: entity_aliases – alternative names and synonyms
CREATE TABLE entity_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias TEXT NOT NULL,
    entity_id UUID REFERENCES entities(entity_id) NOT NULL,
    normalization_score FLOAT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: paper_entities – extracted entity mentions per paper
CREATE TABLE paper_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id) NOT NULL,
    entity_id UUID REFERENCES entities(entity_id) NOT NULL,
    frequency INT NOT NULL,
    section TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- L3 — RELATIONSHIP SYSTEM (EVENT‑SOURCED GRAPH)
-- Table: relationship_instances – raw extracted relationships grounded in evidence
CREATE TABLE relationship_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id) NOT NULL,
    entity_1_id UUID REFERENCES entities(entity_id) NOT NULL,
    entity_2_id UUID REFERENCES entities(entity_id) NOT NULL,
    relation_type TEXT NOT NULL,
    evidence_sentence TEXT NOT NULL,
    section TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    stance TEXT NOT NULL,
    chunk_id UUID REFERENCES paper_chunks(chunk_id) NOT NULL,
    model_version TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: relationship_events – incremental updates to relationship strength
CREATE TABLE relationship_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_1_id UUID NOT NULL,
    entity_2_id UUID NOT NULL,
    relation_type TEXT NOT NULL,
    delta_support INT NOT NULL,
    delta_contradict INT NOT NULL,
    instance_id UUID REFERENCES relationship_instances(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: relationships – aggregated graph representation for querying
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_1_id UUID REFERENCES entities(entity_id) NOT NULL,
    entity_2_id UUID REFERENCES entities(entity_id) NOT NULL,
    relation_type TEXT NOT NULL,
    support_count INT NOT NULL,
    contradict_count INT NOT NULL,
    confidence_score FLOAT NOT NULL,
    strength_score FLOAT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_1_id, entity_2_id, relation_type)
);

-- Table: relationship_graph_map – provenance mapping of graph edges to instances
CREATE TABLE relationship_graph_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) NOT NULL,
    instance_id UUID REFERENCES relationship_instances(id) NOT NULL
);

-- L4 — VALIDATION LAYER
-- Table: paper_validation_scores – multi‑dimensional evaluation of papers
CREATE TABLE paper_validation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID UNIQUE REFERENCES papers(paper_id) NOT NULL,
    novelty_score FLOAT NOT NULL,
    feasibility_score FLOAT NOT NULL,
    falsifiability_score FLOAT NOT NULL,
    reproducibility_score FLOAT NOT NULL,
    impact_score FLOAT NOT NULL,
    ethical_risk_score FLOAT NOT NULL,
    model_version TEXT NOT NULL,
    computed_at TIMESTAMP DEFAULT NOW()
);

-- L5 — GRAPH + CACHE LAYER
-- Table: relationship_graph – materialized high‑speed graph view
CREATE TABLE relationship_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_1_id UUID NOT NULL,
    entity_2_id UUID NOT NULL,
    relation_type TEXT NOT NULL,
    support_count INT NOT NULL,
    contradict_count INT NOT NULL,
    strength_score FLOAT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_1_id, entity_2_id, relation_type)
);

-- Table: entity_statistics – global frequency and co‑occurrence stats
CREATE TABLE entity_statistics (
    entity_id UUID PRIMARY KEY REFERENCES entities(entity_id),
    occurrence_count INT NOT NULL,
    paper_count INT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: paper_summary_cache – precomputed paper summaries for fast retrieval
CREATE TABLE paper_summary_cache (
    paper_id UUID PRIMARY KEY REFERENCES papers(paper_id),
    summary JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: query_logs – stored query history and cached results
CREATE TABLE query_logs (
    query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    retrieval_timestamp TIMESTAMP NOT NULL,
    result JSONB NOT NULL
);

-- L6 — DYNAMIC CATEGORIZATION (GRAPH ROUTING LAYER)
-- Table: dynamic_categories – dynamically generated query‑driven categories
CREATE TABLE dynamic_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    source TEXT NOT NULL,
    usage_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: category_mapping – mapping of dynamic categories to canonical domains
CREATE TABLE category_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dynamic_category_id UUID REFERENCES dynamic_categories(id) NOT NULL,
    canonical_target TEXT NOT NULL,
    canonical_name TEXT NOT NULL,
    similarity_score FLOAT NOT NULL,
    mapping_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: paper_category_map – assignment of papers to categories
CREATE TABLE paper_category_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(paper_id) NOT NULL,
    category_id UUID NOT NULL,
    category_type TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- EXECUTION LAYER (PIPELINE ENGINE)
-- Table: pipeline_jobs – central job queue controlling all pipeline tasks
CREATE TABLE pipeline_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    paper_id UUID,
    status TEXT NOT NULL DEFAULT 'pending',
    priority INT NOT NULL DEFAULT 1,
    payload JSONB NOT NULL,
    locked_by TEXT,
    locked_at TIMESTAMP,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: failed_jobs – failed pipeline executions for replay
CREATE TABLE failed_jobs (
    job_id UUID NOT NULL,
    job_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    payload JSONB NOT NULL,
    failed_at TIMESTAMP DEFAULT NOW()
);

-- Table: pipeline_events – observability log for pipeline actions
CREATE TABLE pipeline_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
