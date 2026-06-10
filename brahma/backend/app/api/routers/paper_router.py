from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.paper import Paper
from app.api.schemas.paper import PaperCreate, PaperUpdate, PaperOut

router = APIRouter(prefix="/papers", tags=["papers"])


@router.get("/", response_model=List[PaperOut])
def get_papers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    papers = db.query(Paper).offset(skip).limit(limit).all()
    return papers


@router.get("/{paper_id}", response_model=PaperOut)
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.post("/", response_model=PaperOut, status_code=status.HTTP_201_CREATED)
def create_paper(
    paper_in: PaperCreate,
    db: Session = Depends(get_db),
):
    paper = Paper(**paper_in.dict())
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


@router.put("/{paper_id}", response_model=PaperOut)
def update_paper(
    paper_id: int,
    paper_in: PaperUpdate,
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    update_data = paper_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(paper, field, value)
    db.commit()
    db.refresh(paper)
    return paper


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