from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.gene import Gene
from app.api.schemas.gene import GeneCreate, GeneUpdate, GeneOut

router = APIRouter(prefix="/genes", tags=["genes"])


@router.get("/", response_model=List[GeneOut])
def get_genes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    genes = db.query(Gene).offset(skip).limit(limit).all()
    return genes


@router.get("/{gene_id}", response_model=GeneOut)
def get_gene(
    gene_id: int,
    db: Session = Depends(get_db),
):
    gene = db.query(Gene).filter(Gene.id == gene_id).first()
    if not gene:
        raise HTTPException(status_code=404, detail="Gene not found")
    return gene


@router.post("/", response_model=GeneOut, status_code=status.HTTP_201_CREATED)
def create_gene(
    gene_in: GeneCreate,
    db: Session = Depends(get_db),
):
    gene = Gene(**gene_in.dict())
    db.add(gene)
    db.commit()
    db.refresh(gene)
    return gene


@router.put("/{gene_id}", response_model=GeneOut)
def update_gene(
    gene_id: int,
    gene_in: GeneUpdate,
    db: Session = Depends(get_db),
):
    gene = db.query(Gene).filter(Gene.id == gene_id).first()
    if not gene:
        raise HTTPException(status_code=404, detail="Gene not found")
    update_data = gene_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gene, field, value)
    db.commit()
    db.refresh(gene)
    return gene


@router.delete("/{gene_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gene(
    gene_id: int,
    db: Session = Depends(get_db),
):
    gene = db.query(Gene).filter(Gene.id == gene_id).first()
    if not gene:
        raise HTTPException(status_code=404, detail="Gene not found")
    db.delete(gene)
    db.commit()
    return None