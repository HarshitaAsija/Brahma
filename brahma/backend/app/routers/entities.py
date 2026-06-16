from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.entity import EntityExtractionResponse, PaperEntityRead
from app.services.entity_extraction import (
    extract_entities_for_paper,
    get_entities_for_paper,
)

router = APIRouter(prefix="/papers", tags=["entities"])


@router.post("/{paper_id}/extract-entities", response_model=EntityExtractionResponse)
def extract_paper_entities(
    paper_id: int,
    db: Session = Depends(get_db),
):
    try:
        entities = extract_entities_for_paper(db, paper_id)
        return EntityExtractionResponse(
            paper_id=paper_id,
            total_entities=len(entities),
            entities=entities,
            message="Entity extraction completed successfully.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{paper_id}/entities", response_model=list[PaperEntityRead])
def list_paper_entities(
    paper_id: int,
    db: Session = Depends(get_db),
):
    return get_entities_for_paper(db, paper_id)

