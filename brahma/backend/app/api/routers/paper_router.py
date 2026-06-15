from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.paper import Paper
from app.api.schemas.paper import PaperCreate, PaperUpdate, PaperOut
from app.schemas.paper import (
    PaperImportRequest,
    PaperImportResponse,
    PaperListResponse,
    PaperRead,
)
from app.services.paper_import import import_paper

router = APIRouter(prefix="/papers", tags=["papers"])


# -----------------------------------------------------------------
# POST /api/v1/papers/import  — import a paper from JSON
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
# GET /api/v1/papers/  — paginated list
# -----------------------------------------------------------------
@router.get("/", response_model=PaperListResponse)
def list_papers(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(10, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    total = db.query(Paper).count()
    papers = db.query(Paper).offset(offset).limit(page_size).all()
    return PaperListResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=papers,
    )


# -----------------------------------------------------------------
# GET /api/v1/papers/{paper_id}  — get single paper
# -----------------------------------------------------------------
@router.get("/{paper_id}", response_model=PaperRead)
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


# -----------------------------------------------------------------
# POST /api/v1/papers/  — create paper manually
# -----------------------------------------------------------------
@router.post("/", response_model=PaperOut, status_code=status.HTTP_201_CREATED)
def create_paper(
    paper_in: PaperCreate,
    db: Session = Depends(get_db),
):
    paper = Paper(**paper_in.model_dump())
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


# -----------------------------------------------------------------
# PUT /api/v1/papers/{paper_id}  — update paper
# -----------------------------------------------------------------
@router.put("/{paper_id}", response_model=PaperOut)
def update_paper(
    paper_id: int,
    paper_in: PaperUpdate,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    update_data = paper_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(paper, field, value)
    db.commit()
    db.refresh(paper)
    return paper


# -----------------------------------------------------------------
# DELETE /api/v1/papers/{paper_id}  — delete paper
# -----------------------------------------------------------------
@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
    return None
