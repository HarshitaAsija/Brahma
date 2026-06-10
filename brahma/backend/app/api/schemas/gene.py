from pydantic import BaseModel, Field
from typing import Optional, List

class GeneBase(BaseModel):
    symbol: str = Field(..., example="BRCA1")
    name: str = Field(..., example="Breast cancer 1")
    description: Optional[str] = None

class GeneCreate(GeneBase):
    pass

class GeneUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None

class GeneOut(GeneBase):
    id: int

    class Config:
        orm_mode = True