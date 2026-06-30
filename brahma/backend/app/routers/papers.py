# backend/app/routers/papers.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db          # your existing DB session dependency
from app.models.paper import Paper
from app.schemas.paper import (
    PaperImportRequest,
    PaperImportResponse,
    PaperListResponse,
    PaperRead,
)
from app.services.paper_import import import_paper

router = APIRouter(
    prefix="/papers",
    tags=["Papers"],
)


# -----------------------------------------------------------------
# POST /papers/import
# Accepts a single JSON paper and saves it to the database.
# -----------------------------------------------------------------
@router.post("/import", response_model=PaperImportResponse)
def import_single_paper(
    payload: PaperImportRequest,
    db: Session = Depends(get_db),
):
    try:
        result = import_paper(db=db, data=payload)
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------
# GET /papers
# Returns a paginated list of all papers.
# -----------------------------------------------------------------
@router.get("/", response_model=PaperListResponse)
def list_papers(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(50, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    total = db.query(Paper).count()
    papers = (
    db.query(Paper)
    .order_by(Paper.created_at.desc())
    .offset(offset)
    .limit(page_size)
    .all()
    )
    
    return PaperListResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=papers,
    )


# -----------------------------------------------------------------
# GET /papers/{paper_id}
# Returns a single paper by its database ID.
# -----------------------------------------------------------------
@router.get("/{paper_id}", response_model=PaperRead)
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper with id {paper_id} not found")
    return paper