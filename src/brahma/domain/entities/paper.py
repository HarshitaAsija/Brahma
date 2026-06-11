# src/brahma/domain/entities/paper.py
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional
from uuid import UUID, uuid4


class DomainError(RuntimeError):
    """Base class for domain specific exceptions."""


class EmptySectionError(DomainError):
    """Raised when a Section has no usable content after stripping."""


@dataclass(frozen=True, slots=True)
class Section:
    heading: str
    content: str

    def is_empty(self) -> bool:
        return not self.content.strip()


@dataclass(frozen=True, slots=True)
class Paper:
    paper_id: UUID
    title: str
    doi: Optional[str] = None
    pmid: Optional[str] = None
    sections: List[Section] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class Chunk:
    chunk_id: UUID
    paper_id: UUID
    section_name: str
    chunk_text: str
