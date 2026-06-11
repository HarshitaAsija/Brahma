# src/brahma/adapters/ingestion_adapter.py
"""Adapter for converting raw scraper JSON into domain objects.

The scraper produces a normalized JSON payload that mirrors the structure of a
:class:`~brahma.domain.entities.paper.Paper`.  This module validates the JSON
and constructs the corresponding :class:`Paper` instance, raising
:class:`DomainError` for any problems.
"""

from __future__ import annotations

import json
from typing import Any, List
from uuid import UUID, uuid4

from brahma.domain.entities.paper import Paper, Section
from brahma.domain.entities.paper import DomainError


def parse_paper_json(raw_json: str) -> Paper:
    """Parse a JSON string into a :class:`Paper`.

    The function expects the JSON to contain ``paper_id`` (optional), ``title``
    and an optional ``doi``, ``pmid`` and ``sections`` list.  ``paper_id`` may be
    omitted in which case a new UUID is generated.  Invalid JSON or missing
    required fields raise :class:`DomainError`.
    """
    try:
        data: dict[str, Any] = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise DomainError(f"Invalid JSON payload: {exc}") from exc

    try:
        # ``paper_id`` is optional – generate one if absent.
        paper_id_raw = data.get("paper_id")
        paper_id = UUID(paper_id_raw) if paper_id_raw else uuid4()
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
