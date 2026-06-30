# backend/app/services/paper_import.py

import hashlib
import json
from datetime import datetime, date

from sqlalchemy.orm import Session

from app.models.paper import Paper
from app.models.raw_paper import RawPaper
from app.schemas.paper import PaperImportRequest, PaperImportResponse


def _make_ingestion_hash(data: PaperImportRequest) -> str:
    """
    Creates a unique fingerprint for each raw paper.
    Uses doi if available, otherwise falls back to title + source.
    This prevents the same paper being imported twice.
    """
    if data.doi:
        unique_string = f"doi:{data.doi}"
    elif data.pmid:
        unique_string = f"pmid:{data.pmid}"
    else:
        # Last resort — hash the title + source combination
        unique_string = f"title:{data.title.strip().lower()}|source:{data.source}"

    return hashlib.sha256(unique_string.encode()).hexdigest()

def parse_pub_date(value):
    if not value:
        return None

    if isinstance(value, date):
        return value

    if isinstance(value, str):
        value = value.strip()

        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y-%m", "%Y"):
            try:
                parsed = datetime.strptime(value, fmt)
                return parsed.date()
            except ValueError:
                continue

    return None

def import_paper(db: Session, data: PaperImportRequest) -> PaperImportResponse:
    """
    Main import function.
    Called by the router when a JSON paper is sent to POST /papers/import.

    Steps:
    1. Compute ingestion hash
    2. Check if raw_papers already has this hash (duplicate check)
    3. If duplicate → return early with duplicate=True
    4. If new → insert into raw_papers, then into papers
    """

    ingestion_hash = _make_ingestion_hash(data)

    # --- Step 1: Duplicate check on raw_papers ---
    existing_raw = (
        db.query(RawPaper)
        .filter(RawPaper.ingestion_hash == ingestion_hash)
        .first()
    )

    if existing_raw:
        # Already imported before — find the matching paper row
        existing_paper = (
            db.query(Paper)
            .filter(
                (Paper.doi == data.doi) if data.doi
                else (Paper.pmid == data.pmid) if data.pmid
                else (Paper.title == data.title)
            )
            .first()
        )
        return PaperImportResponse(
            success=True,
            message="Paper already exists in the database. Skipped import.",
            paper_id=existing_paper.id if existing_paper else None,
            raw_paper_id=existing_raw.id,
            duplicate=True,
        )

    # --- Step 2: Insert into raw_papers (always, even if papers insert fails) ---
    raw_paper = RawPaper(
        ingestion_hash=ingestion_hash,
        raw_title=data.title,
        abstract=data.abstract,
        full_text=data.full_text,
        source=data.source,
        source_external_id=data.source_external_id or "",
        source_url=data.source_url or data.url,
        doi=data.doi,
        pmid=data.pmid,
        authors=data.authors,
        journal=data.journal,
        publication_date=data.publication_date,
        fetch_timestamp=data.fetch_timestamp or datetime.utcnow(),
    )
    db.add(raw_paper)
    db.flush()  # gives us raw_paper.id without committing yet

    # --- Step 3: Insert into papers ---
    pub_date = parse_pub_date(data.publication_date)

    paper = Paper(
        title=data.title,
        abstract=data.abstract,
        full_text=data.full_text,
        authors=data.authors,
        journal=data.journal,
        publication_date=pub_date or date.today(),
        doi=data.doi,
        pmid=data.pmid,
        url=data.url,
        source=data.source,
        open_access=data.open_access or "false",
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    return PaperImportResponse(
        success=True,
        message="Paper imported successfully.",
        paper_id=paper.id,
        raw_paper_id=raw_paper.id,
        duplicate=False,
    )