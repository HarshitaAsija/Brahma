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
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

OUTPUT_DIR = "/home/shalu/brahma_workspace/Brahma/brahma/ai/ingestion/output"


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


# --------------------------------------------------------------------------- #
#  Endpoints
# --------------------------------------------------------------------------- #

@router.post("/search", response_model=SearchResponse)
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

    return SearchResponse(
        query=req.query,
        source=req.source,
        total=len(results),
        articles=[_summarise(r) for r in results],
    )


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
