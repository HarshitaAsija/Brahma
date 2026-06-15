"""initial MVP schema

Revision ID: 20240611_01_initial_mvp
Revises:
Create Date: 2024-06-11 10:00:00.000000
"""

from alembic import op

revision = "20240611_01_initial_mvp"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS pg_trgm;

        CREATE TYPE entity_type AS ENUM ('Drug', 'Disease', 'Gene', 'Protein');
        CREATE TYPE relation_type AS ENUM ('treats', 'associates_with', 'affects', 'prevents');
        CREATE TYPE pipeline_status AS ENUM ('pending', 'running', 'completed', 'failed');

        CREATE TABLE papers (
            id               SERIAL PRIMARY KEY,
            title            TEXT NOT NULL,
            abstract         TEXT NOT NULL,
            full_text        TEXT,
            authors          JSON NOT NULL,
            journal          VARCHAR(255) NOT NULL,
            publication_date DATE NOT NULL,
            doi              VARCHAR(255) UNIQUE,
            pmid             VARCHAR(255) UNIQUE,
            url              TEXT NOT NULL,
            source           VARCHAR(100) DEFAULT 'pubmed',
            open_access      VARCHAR(10)  DEFAULT 'false',
            embedding        VECTOR(1536),
            created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_papers_title    ON papers USING GIN (title gin_trgm_ops);
        CREATE INDEX idx_papers_abstract ON papers USING GIN (abstract gin_trgm_ops);
        CREATE INDEX idx_papers_doi      ON papers (doi);
        CREATE INDEX idx_papers_pmid     ON papers (pmid);

        CREATE TABLE raw_papers (
            id                 SERIAL PRIMARY KEY,
            ingestion_hash     VARCHAR(255) UNIQUE NOT NULL,
            raw_title          TEXT NOT NULL,
            abstract           TEXT,
            full_text          TEXT,
            source             VARCHAR(100) DEFAULT 'pubmed',
            source_external_id VARCHAR(255) NOT NULL,
            source_url         TEXT NOT NULL,
            doi                VARCHAR(255),
            pmid               VARCHAR(255) UNIQUE,
            authors            JSON NOT NULL,
            journal            VARCHAR(255) NOT NULL,
            publication_date   DATE NOT NULL,
            fetch_timestamp    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            created_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE entities (
            id               SERIAL PRIMARY KEY,
            canonical_name   VARCHAR(255) NOT NULL,
            entity_type      entity_type NOT NULL,
            description      TEXT,
            embedding        VECTOR(1536),
            created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (canonical_name, entity_type)
        );

        CREATE INDEX idx_entities_name ON entities (canonical_name);
        CREATE INDEX idx_entities_type ON entities (entity_type);

        CREATE TABLE entity_aliases (
            id         SERIAL PRIMARY KEY,
            alias      VARCHAR(255) NOT NULL,
            entity_id  INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
            source     VARCHAR(100) DEFAULT 'scispaCy',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (alias, entity_id)
        );

        CREATE INDEX idx_entity_aliases_alias ON entity_aliases (alias);

        CREATE TABLE paper_entities (
            id            SERIAL PRIMARY KEY,
            paper_id      INT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
            entity_id     INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
            section       VARCHAR(100) NOT NULL,
            evidence_text TEXT NOT NULL,
            created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (paper_id, entity_id, section)
        );

        CREATE INDEX idx_paper_entities_paper  ON paper_entities (paper_id);
        CREATE INDEX idx_paper_entities_entity ON paper_entities (entity_id);

        CREATE TABLE relationship_instances (
            id                SERIAL PRIMARY KEY,
            paper_id          INT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
            entity_1_id       INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
            entity_2_id       INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
            relation_type     relation_type NOT NULL,
            evidence_sentence TEXT NOT NULL,
            section           VARCHAR(100) NOT NULL,
            confidence_score  FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
            model_version     VARCHAR(100) DEFAULT 'scispaCy-0.4.0',
            created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (paper_id, entity_1_id, entity_2_id, relation_type)
        );

        CREATE INDEX idx_rel_inst_ent1 ON relationship_instances (entity_1_id);
        CREATE INDEX idx_rel_inst_ent2 ON relationship_instances (entity_2_id);
        CREATE INDEX idx_rel_inst_type ON relationship_instances (relation_type);

        CREATE TABLE pipeline_tasks (
            id            SERIAL PRIMARY KEY,
            task_type     VARCHAR(100) NOT NULL,
            paper_id      INT REFERENCES papers(id) ON DELETE SET NULL,
            status        pipeline_status NOT NULL DEFAULT 'pending',
            error_message TEXT,
            model_version VARCHAR(100),
            created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            completed_at  TIMESTAMPTZ
        );

        CREATE INDEX idx_pipeline_status ON pipeline_tasks (status);
        CREATE INDEX idx_pipeline_paper  ON pipeline_tasks (paper_id);
    """)


def downgrade():
    op.execute("""
        DROP TABLE IF EXISTS pipeline_tasks CASCADE;
        DROP TABLE IF EXISTS relationship_instances CASCADE;
        DROP TABLE IF EXISTS paper_entities CASCADE;
        DROP TABLE IF EXISTS entity_aliases CASCADE;
        DROP TABLE IF EXISTS entities CASCADE;
        DROP TABLE IF EXISTS raw_papers CASCADE;
        DROP TABLE IF EXISTS papers CASCADE;
        DROP TYPE IF EXISTS pipeline_status;
        DROP TYPE IF EXISTS relation_type;
        DROP TYPE IF EXISTS entity_type;
        DROP EXTENSION IF EXISTS vector;
        DROP EXTENSION IF EXISTS pg_trgm;
    """)
