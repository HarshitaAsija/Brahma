"""
BRAHMA Ingestion API — demo endpoints for mentor presentation.

Endpoints:
  POST /api/v1/ingestion/search   — scrape papers by keyword
  POST /api/v1/ingestion/pdf      — upload and parse a PDF (with OCR)
  GET  /api/v1/ingestion/results  — list all scraped JSON files

These endpoints run the scrapers directly and return results.
They do NOT write to the database yet (DB integration is next sprint).
"""

import os
import json
import asyncio
import sys
from pathlib import Path
from app.db.session import SessionLocal
from app.schemas.paper import PaperImportRequest
from app.services.paper_import import import_paper
PROJECT_ROOT = Path(__file__).resolve().parents[4]
sys.path.append(str(PROJECT_ROOT))
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel

router = APIRouter(prefix="/ingestion", tags=["ingestion"])
OUTPUT_DIR = "/home/harshita/Projects/Brahma/brahma/ai/ingestion/output"


# --------------------------------------------------------------------------- #
#  Request / Response schemas
# --------------------------------------------------------------------------- #

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5
    source: str = "pmc"   # pmc | pubmed | biorxiv | medrxiv | all


class ArticleSummary(BaseModel):
    source_external_id: str
    title: str
    source: str
    word_count: int
    has_full_text: bool
    has_abstract: bool
    section_count: int
    doi: Optional[str]
    
    publication_date: Optional[str]
    authors: list
    abstract: Optional[str]
    journal: Optional[str]
    keywords: Optional[list]


class SearchResponse(BaseModel):
    query: str
    source: str
    total: int
    articles: list[ArticleSummary]


# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #

def _summarise(article: dict) -> ArticleSummary:
    """Convert a full article dict to a lean summary for API response."""
    return ArticleSummary(
        source_external_id=article.get("source_external_id", ""),
        title=article.get("title", ""),
        source=article.get("source", ""),
        word_count=article.get("word_count", 0)
                   or len((article.get("full_text") or "").split()),
        has_full_text=bool(article.get("full_text")),
        has_abstract=bool(article.get("abstract")),
        section_count=len(article.get("sections") or {}),
        doi=article.get("doi"),
        publication_date=str(article.get("publication_date") or ""),
        authors=article.get("authors") or [],
        abstract=article.get("abstract") or "",
        journal=article.get("journal") or "",
        keywords=article.get("keywords") or [],
    )

def _import_scraped_articles_to_db(articles: list[dict]) -> dict:
    """
    Import scraped articles into raw_papers and papers tables.
    Uses existing paper_import service.
    """
    db = SessionLocal()
    imported = 0
    duplicates = 0
    failed = 0
    errors = []

    try:
        for article in articles:
            try:
                pub_date = article.get("publication_date") or article.get("pub_date") or article.get("date")

                if isinstance(pub_date, str):
                    month_map = {
                             "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
                             "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
                             "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
                    }

                    if len(pub_date) == 4:
                       pub_date = f"{pub_date}-01-01"

                    elif len(pub_date) == 7 and pub_date[4] == "-":
                       year, month = pub_date.split("-")

                       if month.isdigit():
                        pub_date = f"{year}-{month}-01"
                       else:
                        pub_date = f"{year}-{month_map.get(month, '01')}-01"

                  

                payload = PaperImportRequest(
                    title=article.get("title") or "Untitled",
                    abstract=article.get("abstract") or "",
                    full_text=article.get("full_text"),
                    authors=article.get("authors") or [],
                    journal=article.get("journal") or article.get("source") or "Unknown Journal",
                    publication_date=pub_date.replace("-Apr", "-04-01").replace("-May", "-05-01") if isinstance(pub_date, str) else pub_date,
                    doi=article.get("doi"),
                    pmid=article.get("pmid"),
                    url=article.get("url") or article.get("source_url") or "",
                    source_url=article.get("source_url") or article.get("url") or "",
                    source=article.get("source") or "unknown",
                    open_access=article.get("open_access", "false"),
                    source_external_id=article.get("source_external_id") or "",
                    fetch_timestamp=article.get("fetch_timestamp"),
                    scraper_version=article.get("scraper_version"),
                    sections=article.get("sections"),
                    keywords=article.get("keywords"),
                )

                result = import_paper(db, payload)

                if result.duplicate:
                    duplicates += 1
                else:
                    imported += 1

            except Exception as e:
                db.rollback()
                failed += 1
                errors.append({
                    "title": article.get("title"),
                    "error": str(e),
                })

        return {
            "imported": imported,
            "duplicates": duplicates,
            "failed": failed,
            "errors": errors[:5],
        }

    finally:
        db.close()
# --------------------------------------------------------------------------- #
#  Endpoints
# --------------------------------------------------------------------------- #

@router.post("/search")
def search_and_scrape(req: SearchRequest):
    """
    Scrape papers matching the query from the selected source.

    Sources:
      pmc     — PubMed Central (full text, no browser)
      pubmed  — PubMed abstracts only (no browser)
      biorxiv — bioRxiv preprints (headless browser, full text)
      medrxiv — medRxiv preprints (headless browser, full text)
      all     — PMC + bioRxiv + medRxiv combined

    Returns a list of scraped article summaries.
    Full JSON files are saved to /home/shalu/brahma_workspace/Brahma/brahma/ai/ingestion/output/.
    """
    valid_sources = {"pmc", "pubmed", "biorxiv", "medrxiv", "all"}
    if req.source not in valid_sources:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source. Choose from: {valid_sources}",
        )

    # Import here to avoid circular imports at module load
    from ai.ingestion.scrapers.search_scraper import search_and_scrape as pmc_scrape
    from ai.ingestion.scrapers.biorxiv_scraper import search_and_scrape as bio_scrape
    from ai.ingestion.scrapers.pubmed_scraper import search_and_scrape as pub_scrape

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    results = []
    db_import_summary = {
    "imported": 0,
    "duplicates": 0,
    "failed": 0,
    "errors": [],
}
    try:
        if req.source == "pmc":
            results = pmc_scrape(req.query, req.max_results, OUTPUT_DIR)

        elif req.source == "pubmed":
            # PubMed gives abstracts only. We also try PMC for same papers to get full text.
            results = pub_scrape(req.query, req.max_results, OUTPUT_DIR)
            # For each PubMed result, try to get full text from PMC using same query
            try:
                pmc_results = pmc_scrape(req.query, req.max_results, OUTPUT_DIR)
                # Merge: add PMC results not already in results by DOI
                existing_dois = {r.get("doi") for r in results if r.get("doi")}
                for pr in pmc_results:
                    if pr.get("doi") not in existing_dois:
                        results.append(pr)
            except Exception:
                pass

        elif req.source in ("biorxiv", "medrxiv"):
            results = bio_scrape(
                req.query, req.max_results,
                server=req.source, output_dir=OUTPUT_DIR,
            )

        elif req.source == "all":
            results = pmc_scrape(req.query, req.max_results, OUTPUT_DIR)
            per = max(2, req.max_results // 3)
            results += bio_scrape(req.query, per, server="biorxiv", output_dir=OUTPUT_DIR)
            results += bio_scrape(req.query, per, server="medrxiv", output_dir=OUTPUT_DIR)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper error: {e}")
    db_import_summary = _import_scraped_articles_to_db(results)

    response = SearchResponse(
        query=req.query,
        source=req.source,
        total=len(results),
        articles=[_summarise(r) for r in results],
    )

    return {
        **response.model_dump(),
        "db_import": db_import_summary,
    }

@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and extract its text.

    Automatically detects:
      - Digital PDF → extracts text directly (fast)
      - Scanned PDF → runs OCR via Tesseract (slower)

    Returns parsed article data including title, abstract,
    sections, word count, and whether OCR was used.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Save uploaded file temporarily
    upload_dir = "/home/shalu/brahma_workspace/Brahma/brahma/ai/ingestion/output/pdf"
    os.makedirs(upload_dir, exist_ok=True)
    tmp_path = os.path.join(upload_dir, file.filename)

    contents = await file.read()
    with open(tmp_path, "wb") as f:
        f.write(contents)

    # Process with PDF scraper
    from ai.ingestion.scrapers.pdf_scraper import scrape_pdf
    try:
        result = scrape_pdf(tmp_path, output_dir=upload_dir)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {e}")

    if not result:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    # Return summary (not full text — too large for API response)
    return {
        "filename":    file.filename,
        "source_external_id": result.get("source_external_id", ""),
        "title":       result.get("title"),
        "doi":         result.get("doi"),
        "authors":     result.get("authors"),
        "abstract":    result.get("abstract", "")[:500] + "..."
                       if result.get("abstract") else None,
        "word_count":  len((result.get("full_text") or "").split()),
        "section_count": len(result.get("sections") or {}),
        "sections":    list((result.get("sections") or {}).keys()),
        "chunk_count": len(result.get("chunks") or []),
        "ocr_used":    result.get("ocr_used", False),
        "source":      "pdf",
        "saved_to":    f"/home/shalu/brahma_workspace/Brahma/brahma/ai/ingestion/output/pdf/{file.filename}.json",
    }


@router.get("/results")
def list_results(source: Optional[str] = Query(None)):
    """
    List all previously scraped articles saved as JSON files.
    Optionally filter by source (pmc, biorxiv, medrxiv, pubmed, pdf).
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    summaries = []

    # Collect from main output dir and pdf subdir
    dirs = [OUTPUT_DIR, os.path.join(OUTPUT_DIR, "pdf")]
    for d in dirs:
        if not os.path.exists(d):
            continue
        for fname in sorted(os.listdir(d)):
            if not fname.endswith(".json"):
                continue
            fpath = os.path.join(d, fname)
            try:
                with open(fpath, encoding="utf-8") as f:
                    article = json.load(f)
                if source and article.get("source") != source:
                    continue
                summaries.append(_summarise(article))
            except Exception:
                continue

    return {"total": len(summaries), "articles": summaries}

@router.get("/article/{filename}")
def get_full_article(filename: str):
    """Serve full article JSON from disk including full text and sections."""
    import re
    if not re.match(r'^[a-zA-Z0-9_.\-]+\.json$', filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    dirs = [OUTPUT_DIR, os.path.join(OUTPUT_DIR, "pdf")]
    for d in dirs:
        fpath = os.path.join(d, filename)
        if os.path.exists(fpath):
            with open(fpath, encoding="utf-8") as f:
                return json.load(f)
    raise HTTPException(status_code=404, detail=f"File {filename} not found on server")
