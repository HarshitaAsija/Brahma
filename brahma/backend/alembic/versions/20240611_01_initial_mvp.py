"""initial MVP schema

Revision ID: 20240611_01_initial_mvp
Revises:
Create Date: 2024-06-11 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy

# revision identifiers, used by Alembic.
revision = "20240611_01_initial_mvp"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # --------------------------------------------------------------
    # papers
    # --------------------------------------------------------------
    op.create_table(
        "papers",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("abstract", sa.Text, nullable=False),
        sa.Column("full_text", sa.Text),
        sa.Column("authors", sa.JSON, nullable=False),
        sa.Column("journal", sa.String(255), nullable=False),
        sa.Column("publication_date", sa.Date, nullable=False),
        sa.Column("doi", sa.String(255), unique=True),
        sa.Column("pmid", sa.String(255), unique=True),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("source", sa.String(100), server_default=sa.text("'pubmed'")),
        sa.Column("open_access", sa.String(10), server_default=sa.text("'false'")),
        sa.Column("embedding", pgvector.sqlalchemy.Vector(1536)),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("idx_papers_title", "papers", ["title"], postgresql_using="gin")
    op.create_index("idx_papers_abstract", "papers", ["abstract"], postgresql_using="gin")
    op.create_index("idx_papers_doi", "papers", ["doi"])
    op.create_index("idx_papers_pmid", "papers", ["pmid"])

    # --------------------------------------------------------------
    # raw_papers
    # --------------------------------------------------------------
    op.create_table(
        "raw_papers",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("ingestion_hash", sa.String(255), nullable=False, unique=True),
        sa.Column("raw_title", sa.Text, nullable=False),
        sa.Column("abstract", sa.Text),
        sa.Column("full_text", sa.Text),
        sa.Column("source", sa.String(100), server_default=sa.text("'pubmed'")),
        sa.Column("source_external_id", sa.String(255), nullable=False),
        sa.Column("source_url", sa.Text, nullable=False),
        sa.Column("doi", sa.String(255)),
        sa.Column("pmid", sa.String(255), unique=True),
        sa.Column("authors", sa.JSON, nullable=False),
        sa.Column("journal", sa.String(255), nullable=False),
        sa.Column("publication_date", sa.Date, nullable=False),
        sa.Column("fetch_timestamp", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    # --------------------------------------------------------------
    # entity_type enum
    # --------------------------------------------------------------
    entity_type = sa.Enum("Drug", "Disease", "Gene", "Protein", name="entity_type")
    entity_type.create(op.get_bind(), checkfirst=True)

    # --------------------------------------------------------------
    # entities
    # --------------------------------------------------------------
    op.create_table(
        "entities",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("canonical_name", sa.String(255), nullable=False),
        sa.Column("entity_type", entity_type, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("embedding", pgvector.sqlalchemy.Vector(1536)),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("canonical_name", "entity_type", name="uq_entities_canonical_type"),
    )
    op.create_index("idx_entities_name", "entities", ["canonical_name"], unique=False)
    op.create_index("idx_entities_type", "entities", ["entity_type"], unique=False)

    # --------------------------------------------------------------
    # entity_aliases
    # --------------------------------------------------------------
    op.create_table(
        "entity_aliases",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("alias", sa.String(255), nullable=False),
        sa.Column("entity_id", sa.Integer, sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source", sa.String(100), server_default=sa.text("'scispaCy'")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("alias", "entity_id", name="uq_entity_aliases_alias_entity"),
    )
    op.create_index("idx_entity_aliases_alias", "entity_aliases", ["alias"], unique=False)

    # --------------------------------------------------------------
    # paper_entities
    # --------------------------------------------------------------
    op.create_table(
        "paper_entities",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("paper_id", sa.Integer, sa.ForeignKey("papers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_id", sa.Integer, sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("section", sa.String(100), nullable=False),
        sa.Column("evidence_text", sa.Text, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("paper_id", "entity_id", "section", name="uq_paper_entities_paper_entity_section"),
    )
    op.create_index("idx_paper_entities_paper", "paper_entities", ["paper_id"], unique=False)
    op.create_index("idx_paper_entities_entity", "paper_entities", ["entity_id"], unique=False)

    # --------------------------------------------------------------
    # relation_type enum
    # --------------------------------------------------------------
    relation_type = sa.Enum("treats", "associates_with", "affects", "prevents", name="relation_type")
    relation_type.create(op.get_bind(), checkfirst=True)

    # --------------------------------------------------------------
    # relationship_instances
    # --------------------------------------------------------------
    op.create_table(
        "relationship_instances",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("paper_id", sa.Integer, sa.ForeignKey("papers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_1_id", sa.Integer, sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_2_id", sa.Integer, sa.ForeignKey("entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relation_type", relation_type, nullable=False),
        sa.Column("evidence_sentence", sa.Text, nullable=False),
        sa.Column("section", sa.String(100), nullable=False),
        sa.Column("confidence_score", sa.Float, nullable=False),
        sa.Column("model_version", sa.String(100), server_default=sa.text("'scispaCy-0.4.0'")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("paper_id", "entity_1_id", "entity_2_id", "relation_type", name="uq_relationship_instances_paper_entities_type"),
    )
    op.create_index("idx_rel_inst_ent1", "relationship_instances", ["entity_1_id"], unique=False)
    op.create_index("idx_rel_inst_ent2", "relationship_instances", ["entity_2_id"], unique=False)
    op.create_index("idx_rel_inst_type", "relationship_instances", ["relation_type"], unique=False)

    # --------------------------------------------------------------
    # pipeline_status enum
    # --------------------------------------------------------------
    pipeline_status = sa.Enum("pending", "running", "completed", "failed", name="pipeline_status")
    pipeline_status.create(op.get_bind(), checkfirst=True)

    # --------------------------------------------------------------
    # pipeline_tasks
    # --------------------------------------------------------------
    op.create_table(
        "pipeline_tasks",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("task_type", sa.String(100), nullable=False),
        sa.Column("paper_id", sa.Integer, sa.ForeignKey("papers.id", ondelete="SET NULL")),
        sa.Column("status", pipeline_status, nullable=False, server_default=sa.text("'pending'")),
        sa.Column("error_message", sa.Text),
        sa.Column("model_version", sa.String(100)),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("completed_at", sa.TIMESTAMP(timezone=True)),
    )
    op.create_index("idx_pipeline_status", "pipeline_tasks", ["status"], unique=False)
    op.create_index("idx_pipeline_paper", "pipeline_tasks", ["paper_id"], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_table("pipeline_tasks")
    op.drop_table("relationship_instances")
    op.drop_table("paper_entities")
    op.drop_table("entity_aliases")
    op.drop_table("entities")
    op.drop_table("raw_papers")
    op.drop_table("papers")
    # Drop enums
    op.execute("DROP TYPE IF EXISTS pipeline_status")
    op.execute("DROP TYPE IF EXISTS relation_type")
    op.execute("DROP TYPE IF EXISTS entity_type")
    # Drop extension (optional – safe to keep)
    op.execute("DROP EXTENSION IF EXISTS vector")
