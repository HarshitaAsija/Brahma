# BRAHMA — Literature Ingestion Pipeline

BRAHMA (Biomedical Research AI for Hypothesis and Mechanism Analysis) ingests biomedical literature from multiple sources, extracts full text, structures it into sections and chunks, and exposes it through an API and UI so it can later feed BRAHMA's RAG and hypothesis-generation pipeline.

This document covers the **Literature Ingestion Module**: the scrapers, the full-text resolver, the FastAPI backend, and the frontend (both the standalone HTML demo and the Next.js integration).

---

## Table of Contents

1. [Glossary](#glossary)
2. [Architecture Overview](#architecture-overview)
3. [Directory Structure](#directory-structure)
4. [Scrapers](#scrapers)
5. [Full-Text Resolver](#full-text-resolver)
6. [Backend (FastAPI)](#backend-fastapi)
7. [Frontend](#frontend)
8. [Setup](#setup)
9. [Running the System](#running-the-system)
10. [Testing](#testing)
11. [Git Workflow](#git-workflow)
12. [Known Issues / Notes](#known-issues--notes)
13. [Next Steps](#next-steps)

---

## Glossary

| Term | Meaning |
|---|---|
| **PMC (PubMed Central)** | Free full-text archive of biomedical papers run by the US National Library of Medicine. Returns complete article XML. |
| **PubMed** | Database of citations and abstracts only (no full text) from the same NLM family. |
| **NCBI E-utilities** | Free REST API set from NCBI. `esearch` finds IDs by keyword/DOI, `efetch` retrieves the full record. |
| **Europe PMC** | A separate, independently-run full-text aggregator (EBI) with broader open-access coverage than NCBI PMC. Used as a fallback. |
| **DOI** | Digital Object Identifier — permanent ID for a paper, e.g. `10.1038/s41586-021-03819-2`. Resolves at `https://doi.org/<doi>`. |
| **bioRxiv / medRxiv** | Preprint servers (biology / medicine) requiring a real browser because content is JS-rendered. |
| **Headless browser** | A browser with no visible window (`headless=True`). No popup, no taskbar icon. |
| **OCR (Optical Character Recognition)** | Reads text out of scanned/image-only PDF pages using Tesseract. |
| **Chunking** | Splitting a paper into sections (Introduction, Methods, Results…) for RAG retrieval. |
| **RAG** | Retrieval-Augmented Generation — retrieve relevant chunks, then generate an answer/hypothesis grounded in them. |
| **FastAPI / uvicorn** | Python API framework / the server that runs it. |
| **PYTHONPATH** | Env var telling Python where to find modules; must include the project root so both `app.*` (backend) and `ai.*` (scrapers) imports resolve. |

---

## Architecture Overview

```
Search query (frontend)
        │
        ▼
FastAPI ingestion_router  ──────────────────────────────────────────┐
        │                                                            │
        ▼                                                            ▼
 ┌────────────┐   ┌───────────────┐   ┌──────────────┐   ┌──────────────────┐
 │ PMC scraper│   │PubMed scraper │   │bioRxiv/medRxiv│   │  PDF scraper      │
 │ (httpx,    │   │ (httpx +      │   │ (headless     │   │ (PyMuPDF + OCR    │
 │  no browser│   │  fulltext_    │   │  Chromium via │   │  for scanned PDFs)│
 │  full text)│   │  resolver)    │   │  browser.py)  │   │                   │
 └────────────┘   └───────────────┘   └──────────────┘   └──────────────────┘
        │                 │                   │                    │
        └─────────────────┴─────────┬─────────┴────────────────────┘
                                     ▼
                     ai/ingestion/output/*.json  (single output folder)
                                     │
                                     ▼
                    Frontend (search results, view details,
                    open on source site, download full JSON)
                                     │
                                     ▼
                  (NEXT SPRINT) DB → embeddings → RAG → hypotheses
```

Every scraper returns/saves the **same JSON schema** regardless of source, so downstream code never needs to know which scraper produced a given file.

---

## Directory Structure

```
brahma/
├── ai/
│   └── ingestion/
│       ├── run_ingestion.py          # CLI entry point
│       ├── output/                   # SINGLE output folder — all scraped JSON here
│       │   └── pdf/                  # PDF-upload JSONs saved here
│       ├── normalizer/
│       │   └── normalizer.py
│       └── scrapers/
│           ├── base.py               # RawArticle dataclass, normalize_section_name(), build_chunks()
│           ├── browser.py            # shared headless Chromium utility
│           ├── fulltext_resolver.py  # DOI → full text via PMC / Europe PMC APIs
│           ├── pmc_scraper.py        # PMC full text (httpx, no browser)
│           ├── pubmed_scraper.py     # PubMed + fulltext_resolver fallback
│           ├── biorxiv_scraper.py    # bioRxiv / medRxiv (headless browser)
│           ├── medrxiv_scraper.py    # medRxiv-specific helpers
│           ├── pdf_scraper.py        # digital + OCR PDF extraction
│           ├── search_scraper.py     # legacy unified entry point (delegates to pmc_scraper)
│           ├── oai_scraper.py
│           └── rss_scraper.py
│
├── backend/
│   └── app/
│       ├── main.py                          # FastAPI app, registers routers, lazy-loads paper_router
│       ├── core/config.py                   # settings (DB, ports, CORS)
│       └── api/routers/
│           ├── paper_router.py               # existing CRUD (needs Postgres)
│           └── ingestion_router.py            # search / pdf upload / results / full-article endpoints
│
└── frontend/
    ├── demo/
    │   └── index.html                 # standalone HTML demo (search, upload, details, downloads)
    ├── app/
    │   └── literature-ingestion/page.tsx   # Next.js page mounting the ingestion panel
    └── components/
        └── IngestionPanel.tsx          # Next.js/React component (TypeScript) — production integration
```

> **One output folder only.** Earlier in development the data was duplicated between `ai/ingestion/output/` and `backend/ai/ingestion/output/`. This has been consolidated: every scraper and the backend now point at the single absolute path `ai/ingestion/output/`. Do not recreate a second output folder.

---

## Scrapers

All scrapers return (and where applicable save) a dict with this schema:

```json
{
  "doi": "10.1101/2025.07.24.666669",
  "pmid": null,
  "title": "...",
  "abstract": "...",
  "full_text": "...",
  "sections": { "Introduction": "...", "Methods": "...", "Results": "...", "Discussion": "..." },
  "authors": ["..."],
  "journal": "...",
  "publication_date": "...",
  "article_type": "...",
  "language": "en",
  "keywords": [],
  "mesh_terms": [],
  "open_access": true,
  "retracted": false,
  "retraction_reason": null,
  "source": "pmc | pubmed | biorxiv | medrxiv | pdf",
  "source_external_id": "...",
  "source_url": "...",
  "word_count": 1234,
  "fetch_timestamp": "...",
  "scraper_version": "1.0.0"
}
```

### `pmc_scraper.py`
Fetches **full text** from PubMed Central via NCBI E-utilities (`esearch` + `efetch`, XML). No browser. Rate-limited to 3 req/s without an API key (10/s with one — set `NCBI_API_KEY` at the top of the file). Returns complete article body, structured `sections`, authors, DOI, MeSH terms. Has its own `search_and_scrape()` that saves each result as `pmc_<PMCID>.json` (or `PMC<id>.json` depending on which code path is used — see [Known Issues](#known-issues--notes)).

### `pubmed_scraper.py`
Fetches abstracts + metadata via NCBI E-utilities. **By itself PubMed only returns abstracts.** This scraper now also calls `fulltext_resolver.resolve_fulltext_from_doi(doi)` for every result with a DOI, and if a full text is found it replaces the abstract-only `full_text`/`sections`/`open_access` fields with the resolved full content. If no open-access full text exists anywhere, it cleanly falls back to abstract-only.

### `fulltext_resolver.py`
The piece that turns "abstract only" into "full text" for PubMed (and can be reused anywhere a DOI is available). Pure API calls — **no Playwright, no browser, no CAPTCHA risk**.

Resolution order:
1. **NCBI PMC** — `esearch?db=pmc&term=<doi>[doi]` to get a PMCID, then `efetch` the PMC XML and parse `<body>//<p>` and `<sec>` into `full_text` + `sections`.
2. **Europe PMC REST API** — `search?query=DOI:<doi>` to find a PMCID, then `GET /{pmcid}/fullTextXML`. This is the fallback that catches papers NCBI PMC's search occasionally fails to resolve (observed intermittent `esearch` JSON errors; Europe PMC reliably picks these up).
3. If neither finds open-access full text → returns `None` and the caller keeps the PubMed abstract.

In testing, real-world results: 5,594 – 11,624 words of full text retrieved per paper, with 5–28 structured sections, vs. ~200–2,000 words when only the abstract was available.

### `biorxiv_scraper.py` / `medrxiv_scraper.py`
Scrapes bioRxiv and medRxiv preprints using the shared headless browser (`browser.py`). Extracts full text from the `highwire-markup` HTML block, splitting on `<h2>` headings into `sections`. Filters out noise sections (references, acknowledgements, competing interests, etc.).

### `pdf_scraper.py`
Handles PDFs already on disk (uploaded by a user, downloaded from a journal, etc.).
- **Digital PDF** (text embedded) → fast direct extraction via PyMuPDF (`fitz`).
- **Scanned PDF** (image-only pages, <50 chars of extractable text + has images) → each page rendered to a 300-DPI PNG, then **Tesseract OCR** (`pytesseract`) reads the text.
- Sets `"ocr_used": true/false` so downstream code knows which path was used.
- Builds RAG-ready `chunks` via `base.build_chunks()` before saving.

### `browser.py`
Shared headless Chromium utility used by `biorxiv_scraper.py`. Key properties:
- `headless=True` — genuinely no window, no taskbar icon (earlier versions used Xvfb + `headless=False`, which still showed a taskbar icon; this was fixed).
- Disables `navigator.webdriver` and other automation fingerprints.
- "Warms" the session by visiting Google first to look like a real user before hitting the target site — reduces CAPTCHA triggers.
- Detects CAPTCHA pages by `<title>` content and retries once after a 20s wait.

### `base.py`
Shared foundation:
- `RawArticle` dataclass — canonical structure every scraper conforms to, with `.to_dict()` and `.get_chunks()`.
- `normalize_section_name(raw)` — maps messy real-world headings ("2.3. Materials and Methods", "EXPERIMENTAL MODEL AND SUBJECT DETAILS") to canonical types (`introduction`, `methods`, `results`, `discussion`, `conclusion`, `references`, or `_noise_`).
- `build_chunks(sections, abstract, title)` — produces a list of `{section_type, section_label, text, word_count}` chunks, abstract first, noise/references dropped. This is what the RAG pipeline will consume.

### `search_scraper.py`
Legacy unified entry point; currently delegates to `pmc_scraper.run_pmc()`. Kept for backward compatibility with `run_ingestion.py`.

---

## Full-Text Resolver — Why It Exists

PubMed's own API only ever returns an abstract — there is no full text in the PubMed record itself. The naive approach (visit the DOI redirect page with a headless browser and regex-search for a PMC ID) was slow, fragile, and CAPTCHA-prone. `fulltext_resolver.py` replaces that with two fast, free, official REST APIs (NCBI PMC, then Europe PMC), each queried directly with the DOI — no browser needed at all for this path.

```python
from ai.ingestion.scrapers.fulltext_resolver import resolve_fulltext_from_doi

result = resolve_fulltext_from_doi("10.1038/s41586-021-03819-2")
# {'full_text': '...', 'sections': {...}, 'source': 'europepmc', 'open_access': True}
```

---

## Backend (FastAPI)

`backend/app/api/routers/ingestion_router.py` exposes:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/ingestion/search` | Scrape papers by keyword. Body: `{query, source, max_results}`. `source` ∈ `pmc \| pubmed \| biorxiv \| medrxiv \| all`. |
| `POST` | `/api/v1/ingestion/pdf` | Upload a PDF (`multipart/form-data`, field `file`). Returns summary incl. `ocr_used`, `chunk_count`. |
| `GET` | `/api/v1/ingestion/results` | List all previously scraped articles on disk. Optional `?source=` filter. |
| `GET` | `/api/v1/ingestion/article/{filename}` | Serve the **complete** JSON (full text, sections, chunks) for a given saved filename. |

`backend/app/main.py` registers `ingestion_router` unconditionally and **lazy-loads** `paper_router` inside a `try/except` — if Postgres/pgvector isn't running, the ingestion API still starts cleanly (you'll see a `paper_router skipped (DB not available)` warning, which is expected and harmless for ingestion work).

CORS is open (`allow_origins=["*"]`) so the frontend can call the API from `localhost:3000` during development.

---

## Frontend

Two frontends exist side by side, intentionally:

### 1. Standalone HTML demo — `frontend/demo/index.html`
Zero build step, zero framework. Pure HTML/CSS/JS calling the FastAPI backend directly. Good for quick local testing and mentor demos. Features: Google-Scholar-style search bar with source pills, paper cards with full-text/abstract-only badges, per-source buttons (PMC / PubMed / bioRxiv / medRxiv / Journal Site), a details modal, **Full JSON** download (fetches the complete server-side file, not just the API summary), **Get PDF**, drag-and-drop PDF upload with OCR, and an "All Saved Papers" tab.

Run it with:
```bash
cd frontend/demo
python3 -m http.server 3000
```

### 2. Next.js integration — `frontend/app/literature-ingestion/page.tsx` + `frontend/components/IngestionPanel.tsx`
The **production path**. Because BRAHMA's main frontend is a Next.js/React/TypeScript app (not plain HTML), the ingestion UI is being ported into a proper React component (`IngestionPanel.tsx`) mounted as a route (`/literature-ingestion`) inside the existing Next.js app, on branch `feature/ingestion-nextjs-integration`. This is what will actually get merged into the main product frontend — the HTML demo will not be merged as-is.

Run the Next.js app the same way the rest of the main frontend is run (inside `frontend/`):
```bash
cd frontend
npm install
npm run dev
```
Then visit `http://localhost:3000/literature-ingestion`.

---

## Setup

```bash
# Clone and enter the repo
git clone https://github.com/HarshitaAsija/Brahma.git
cd Brahma/brahma

# Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings \
            python-multipart httpx playwright pymupdf \
            pytesseract pillow pgvector

# Playwright's bundled Chromium (used by browser.py)
playwright install chromium

# Tesseract OCR engine (system package, for scanned PDFs)
sudo apt-get install tesseract-ocr

# Node deps for the Next.js frontend (if working on the React integration)
cd frontend && npm install && cd ..

# Switch to the working branch
git checkout feature/ingestion-nextjs-integration
```

---

## Running the System

**Always activate the venv first, and always run uvicorn from inside `backend/` with `PYTHONPATH` pointing at the project root** — this lets `app.*` imports (backend) and `ai.*` imports (scrapers) resolve simultaneously.

**Terminal 1 — Backend API:**
```bash
cd brahma/backend
source ../.venv/bin/activate
PYTHONPATH=/absolute/path/to/brahma \
uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload
```
Wait for `Application startup complete.`

**Terminal 2a — HTML demo frontend:**
```bash
cd brahma/frontend/demo
python3 -m http.server 3000
```
Open `http://localhost:3000` (do **not** open `index.html` as a `file://` URL — CORS will block API calls).

**Terminal 2b — Next.js frontend (alternative to 2a):**
```bash
cd brahma/frontend
npm run dev
```
Open `http://localhost:3000/literature-ingestion`.

> Helper scripts `start_backend.sh` / `start_frontend.sh` at the repo root wrap the Terminal 1 / 2a commands above for convenience.

---

## Testing

Run from the **project root**, venv activated.

**PMC (full text, no browser):**
```bash
python3 -c "
import asyncio
from ai.ingestion.scrapers.pmc_scraper import run_pmc
papers = asyncio.run(run_pmc('cancer immunotherapy', max_results=2))
for p in papers:
    print(p['title'][:70], '|', p['word_count'], 'words |', list(p['sections'])[:3])
"
```

**PubMed (abstract → full text via resolver fallback):**
```bash
python3 -c "
import sys; sys.path.insert(0, '.')
from ai.ingestion.scrapers.pubmed_scraper import search_and_scrape
papers = search_and_scrape('CRISPR gene editing', max_results=2)
for p in papers:
    print(p['title'][:60])
    print('  words:', p['word_count'], '| open_access:', p['open_access'], '| sections:', len(p['sections']))
"
```

**Full-text resolver directly:**
```bash
python3 -c "
from ai.ingestion.scrapers.fulltext_resolver import resolve_fulltext_from_doi
r = resolve_fulltext_from_doi('10.1038/s41586-021-03819-2')
print('OK' if r else 'FAILED', '-', len(r['full_text'].split()) if r else 0, 'words, source:', r['source'] if r else None)
"
```

**bioRxiv / medRxiv (headless browser, 30–60s):**
```bash
python3 -c "
from ai.ingestion.scrapers.biorxiv_scraper import search_and_scrape
papers = search_and_scrape('Alzheimer neurodegeneration', max_results=2, server='biorxiv')
for p in papers:
    print(p['title'][:70], '|', p['word_count'], 'words')
"
```

**PDF (digital or scanned/OCR):**
```bash
python3 -c "
from ai.ingestion.scrapers.pdf_scraper import scrape_pdf
r = scrape_pdf('path/to/paper.pdf')
print(r['title'], '|', r['word_count'], 'words | OCR used:', r['ocr_used'])
"
```

**Chunking:**
```bash
python3 -c "
import json, os
from ai.ingestion.scrapers.base import build_chunks
out = 'ai/ingestion/output'
f = next(x for x in os.listdir(out) if x.endswith('.json'))
d = json.load(open(f'{out}/{f}'))
for c in build_chunks(d.get('sections', {}), d.get('abstract', '')):
    print(f'[{c[\"section_type\"]:12}] {c[\"section_label\"][:30]:30} {c[\"word_count\"]} words')
"
```

**CLI pipeline (all sources):**
```bash
python3 -m ai.ingestion.run_ingestion --query "cancer immunotherapy" --max 3 --source all
```

**API endpoints (with backend running):**
```bash
curl http://localhost:8000/health

curl -s -X POST http://localhost:8000/api/v1/ingestion/search \
  -H "Content-Type: application/json" \
  -d '{"query": "cancer immunotherapy", "source": "pmc", "max_results": 3}'

curl http://localhost:8000/api/v1/ingestion/results

curl http://localhost:8000/api/v1/ingestion/article/PMC13193533.json

curl -X POST http://localhost:8000/api/v1/ingestion/pdf -F "file=@paper.pdf"
```

---

## Git Workflow

All ingestion work happens on feature branches, never directly on `main`:

```bash
git branch                                    # confirm you're on a feature branch
git add <specific files>                      # avoid `git add -A` blindly — check status first
git commit -m "clear description"
git push origin <branch-name>                 # only updates that branch, never main
```

To open work up for team review (does **not** merge anything by itself):
GitHub → repo → **Pull Requests** → **New Pull Request** → base `main` ← compare `<feature-branch>` → add reviewers → **Create Pull Request**. Merge only happens after teammates approve.

Recent branches:
- `feature/headless-clean-scrapers` — headless browser fix, chunking, OCR PDF scraper, HTML demo frontend, output-path consolidation.
- `feature/ingestion-nextjs-integration` — full-text resolver, PubMed/PMC full-text fix, Next.js/React `IngestionPanel` component for production integration.

---

## Known Issues / Notes

- **NCBI PMC `esearch` intermittent empty response.** Occasionally returns `Expecting value: line 1 column 1` instead of JSON for the DOI→PMCID lookup. The Europe PMC fallback in `fulltext_resolver.py` reliably catches these cases, so end-to-end results are unaffected — just expect to see that warning logged before the Europe PMC success line.
- **PDF/JSON filename consistency.** The filename a scraper saves to disk must exactly match what any consumer (frontend, API) requests back. `source_external_id` should always be derived from the actual saved filename (minus `.json`), not recomputed independently, to avoid 404s like `PMCPMC123.json` or doubled-path bugs.
- **Single output directory.** Don't reintroduce `backend/ai/ingestion/output/` as a second location — every scraper and the router must point at one absolute path under `ai/ingestion/output/`.
- **Word/section counts vary by topic.** Open-access coverage differs by field; some PubMed results will remain abstract-only if no PMC/Europe PMC copy exists — this is expected behavior, not a bug.
- **JSON files should be opened with a code editor or browser, not Word.** Word renders JSON as one unformatted blob; use VS Code (`Shift+Alt+F` to format), Notepad++, or drag the file into a browser tab.

---

## Next Steps

1. **Database integration** — persist scraped papers into Postgres (`raw_papers` table) instead of JSON files only.
2. **Embeddings** — generate BioBERT/SciBERT vectors per chunk, store in `pgvector`.
3. **RAG retrieval** — given a research question, retrieve top-k relevant chunks.
4. **Hypothesis generation** — LLM generates hypotheses grounded in retrieved chunks.
5. **Frontend merge** — finish porting `IngestionPanel.tsx` into the main Next.js product frontend; retire the standalone HTML demo once parity is reached.
