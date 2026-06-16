from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EntityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    canonical_name: str
    entity_type: str
    description: str | None = None
    created_at: datetime | None = None


class PaperEntityRead(BaseModel):
    entity_id: int
    canonical_name: str
    entity_type: str
    section: str
    evidence_text: str


class EntityExtractionResponse(BaseModel):
    paper_id: int
    total_entities: int
    entities: list[PaperEntityRead]
    message: str
