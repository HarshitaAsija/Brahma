from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from app.db.base import Base

PIPELINE_STATUS = ("pending", "running", "completed", "failed")
pipeline_status_enum = Enum(*PIPELINE_STATUS, name="pipeline_status")

class PipelineTask(Base):
    __tablename__ = "pipeline_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String(100), nullable=False)      # e.g. ingest_pubmed, extract_entities
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="SET NULL"))
    status = Column(pipeline_status_enum, nullable=False, default="pending")
    error_message = Column(Text)
    model_version = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
