import re
import json
import os
from datetime import datetime
from typing import Optional
import fitz  # PyMuPDF
from ai.ingestion.scrapers.base import SCRAPER_VERSION

def _extract_sections(text: str) -> dict:
    """
    Split full text into sections by detecting common headings.
    Works for most biomedical papers.
    """
    section_patterns = [
        "abstract", "introduction", "background",
        "methods", "materials and methods", "methodology",
        "results", "findings",
        "discussion", "conclusion", "conclusions",
        "references", "acknowledgements", "funding"
    ]

    sections = {}
    current_section = "preamble"
    current_text = []

    for line in text.split("\n"):
        line_clean = line.strip().lower()
        matched = False
        for pat in section_patterns:
            if line_clean == pat or line_clean.startswith(pat + " ") or line_clean == pat + ".":
                if current_text:
                    sections[current_section] = " ".join(current_text).strip()
                current_section = line.strip()
                current_text = []
                matched = True
                break
        if not matched:
            current_text.append(line.strip())

    if current_text:
        sections[current_section] = " ".join(current_text).strip()

    return sections

def _extract_metadata(text: str, doc) -> dict:
    """Extract title, authors, doi from PDF text and metadata."""

    # Try PDF metadata first
    meta = doc.metadata or {}
    title = meta.get("title", "").strip()
    author_str = meta.get("author", "").strip()

    # Fallback: first non-empty line is usually the title
    if not title:
        for line in text.split("\n")[:20]:
            line = line.strip()
            if len(line) > 20 and not line.startswith("http"):
                title = line
                break

    # Authors from metadata string
    authors = []
    if author_str:
        authors = [a.strip() for a in re.split(r"[;,]", author_str) if a.strip()]

    # DOI from text
    doi = None
    doi_match = re.search(r"10\.\d{4,}/[^\s\"'<>]+", text)
    if doi_match:
        doi = doi_match.group(0).rstrip(".")

    # Abstract — text between "abstract" and next section
    abstract = None
    ab_match = re.search(
        r"(?i)abstract[\s\n]+(.*?)(?=\n[A-Z][A-Z\s]{3,}\n|\Z)",
        text, re.DOTALL
    )
    if ab_match:
        abstract = re.sub(r"\s+", " ", ab_match.group(1)).strip()[:3000]

    return title, authors, doi, abstract

def scrape_pdf(pdf_path: str, output_dir: str = "/home/harshita/Projects/Brahma/brahma/ai/ingestion/output/pdf") -> Optional[dict]:
    """
    F5 - PDF batch import.
    Extracts text and metadata from a PDF file using PyMuPDF.
    No browser or Docker needed.
    
    pdf_path: path to the PDF file
    Returns: article dict matching BRAHMA schema
    """
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(pdf_path):
        print(f"[ERROR] File not found: {pdf_path}")
        return None

    print(f"[PDF] Processing: {pdf_path}")

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"[ERROR] Cannot open PDF: {e}")
        return None

    # Extract all text page by page
    full_text_pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        full_text_pages.append(page.get_text())

    full_text = "\n".join(full_text_pages)
    print(f"[PDF] Extracted {len(full_text)} chars from {len(doc)} pages")

    title, authors, doi, abstract = _extract_metadata(full_text, doc)
    sections = _extract_sections(full_text)

    # Remove references section from full_text for cleanliness
    ref_idx = full_text.lower().find("\nreferences\n")
    clean_text = full_text[:ref_idx] if ref_idx > -1 else full_text

    doc.close()

    fname = re.sub(r"[^a-z0-9]", "_", os.path.basename(pdf_path).lower()) + ".json"
    out_path = os.path.join(output_dir, fname)

    from ai.ingestion.scrapers.base import build_chunks
    chunks = build_chunks(sections, abstract=abstract or "", title=title or "")

    result = {
        "doi": doi,
        "pmid": None,
        "title": title or os.path.basename(pdf_path),
        "abstract": abstract,
        "full_text": clean_text,
        "sections": sections,
        "chunks": chunks,
        "authors": authors,
        "journal": None,
        "publication_date": None,
        "article_type": "PDF Import",
        "language": "en",
        "keywords": [],
        "mesh_terms": [],
        "open_access": False,
        "retracted": False,
        "retraction_reason": None,
        "source": "pdf",
        "source_external_id": fname.replace(".json", ""),
        "source_url": f"file://{os.path.abspath(pdf_path)}",
        "ocr_used": False,
        "word_count": len(clean_text.split()) if clean_text else 0,
        "chunk_count": len(chunks),
        "fetch_timestamp": datetime.utcnow().isoformat(),
        "scraper_version": SCRAPER_VERSION,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"[SAVED] {fname}")
    print(f"[PARSED] title={bool(title)} abstract={bool(abstract)} doi={doi} sections={list(sections.keys())[:4]}")
    return result

def batch_scrape_pdfs(pdf_folder: str, output_dir: str = "/home/harshita/Projects/Brahma/brahma/ai/ingestion/output/pdf") -> list:
    """
    Scrape all PDFs in a folder.
    Use this to bulk import a folder of downloaded papers.
    """
    results = []
    pdf_files = [f for f in os.listdir(pdf_folder) if f.endswith(".pdf")]
    print(f"[PDF] Found {len(pdf_files)} PDF files in {pdf_folder}")

    for fname in pdf_files:
        path = os.path.join(pdf_folder, fname)
        result = scrape_pdf(path, output_dir)
        if result:
            results.append(result)

    print(f"[DONE] Processed {len(results)}/{len(pdf_files)} PDFs")
    return results
