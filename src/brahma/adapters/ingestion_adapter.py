# src/brahma/adapters/ingestion_adapter.py
from __future__ import annotations

import json
from typing import Any, List
from uuid import UUID

from brahma.domain.entities.paper import Paper, Section
from brahma.domain.entities.paper import DomainError


def parse_paper_json(raw_json: str) -> Paper:
    """Parse the normalized JSON produced by the scraper into a ``Paper`` domain object.
    Raises :class:`DomainError` for malformed input.
    """
    try:
        data: dict[str, Any] = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise DomainError(f"Invalid JSON payload: {exc}") from exc

    try:
        paper_id = UUID(data["paper_id"])
        title = str(data["title"])
        doi = data.get("doi")
        pmid = data.get("pmid")
        raw_sections = data.get("sections", [])
    except (KeyError, ValueError) as exc:
        raise DomainError(f"Missing required fields: {exc}") from exc

    sections: List[Section] = []
    for sec in raw_sections:
        try:
            heading = str(sec["heading"])
            content = str(sec["content"])
            sections.append(Section(heading=heading, content=content))
        except (KeyError, TypeError) as exc:
            # Skip malformed sections but continue processing the rest.
            print(f"[WARN] Malformed section ignored: {exc}")

    return Paper(
        paper_id=paper_id,
        title=title,
        doi=doi,
        pmid=pmid,
        sections=sections,
    )
