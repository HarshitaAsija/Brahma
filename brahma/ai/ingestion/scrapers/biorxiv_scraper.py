"""
bioRxiv / medRxiv scraper for BRAHMA.
- bioRxiv: uses Botasaurus @request (humane HTTP, bypasses 403)
- medRxiv: uses plain requests (works fine, DOI prefix: 10.64898)
"""
import re
import json
import os
import time
import random
import requests
from typing import Optional
from datetime import datetime

from botasaurus.request import request, Request

from ai.ingestion.scrapers.base import SCRAPER_VERSION

_DOI_PREFIX = {
    "biorxiv": "10.1101",
    "medrxiv": "10.64898",
}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def polite_sleep() -> None:
    time.sleep(random.uniform(2.0, 4.0))


# --------------------------------------------------------------------------- #
#  Botasaurus fetcher for bioRxiv
# --------------------------------------------------------------------------- #

@request(output=None)
def _bota_fetch(req: Request, url):
    """Fetch a single URL using Botasaurus humane request."""
    try:
        r = req.get(url)
        if r.status_code == 200:
            return r.text
        print(f"[FETCH] HTTP {r.status_code} for {url}")
        return ""
    except Exception as e:
        print(f"[FETCH] Error: {e}")
        return ""


def fetch_biorxiv(url: str, wait: float = 2.0) -> str:
    html = _bota_fetch(url)
    if html:
        time.sleep(wait + random.uniform(0.5, 1.5))
    return html or ""


# --------------------------------------------------------------------------- #
#  Plain requests fetcher for medRxiv
# --------------------------------------------------------------------------- #

def fetch_medrxiv(url: str, wait: float = 2.0) -> str:
    try:
        r = requests.get(url, headers=_HEADERS, timeout=20)
        if r.status_code == 200:
            time.sleep(wait + random.uniform(0.5, 1.5))
            return r.text
        print(f"[FETCH] HTTP {r.status_code} for {url}")
        return ""
    except Exception as e:
        print(f"[FETCH] Error: {e}")
        return ""


# --------------------------------------------------------------------------- #
#  Parsing helpers
# --------------------------------------------------------------------------- #

def _decode_html(raw: str) -> str:
    raw = (raw.replace("&lt;", "<").replace("&gt;", ">")
              .replace("&amp;", "&").replace("&#39;", "'")
              .replace("&quot;", '"'))
    return re.sub(r"<[^>]+>", "", raw).strip()


def _extract_abstract(html: str) -> Optional[str]:
    idx = html.find("abstract-1")
    if idx != -1:
        chunk = html[idx: idx + 3000]
        chunk = re.sub(r"<h2[^>]*>.*?</h2>", "", chunk, flags=re.DOTALL)
        p_match = re.search(r"<p[^>]*>(.*?)</p>", chunk, re.DOTALL)
        if p_match:
            text = re.sub(r"<[^>]+>", " ", p_match.group(1))
            return re.sub(r"\s+", " ", text).strip()
    meta = re.search(r'name="abstract"[^>]*content="([^"]+)"', html)
    if meta:
        return _decode_html(meta.group(1))
    return None


_SKIP_SECTIONS = {
    "references", "acknowledgements", "acknowledgments", "footnotes",
    "subject area", "follow this preprint", "citation manager formats",
    "share this article", "author contributions", "competing interests",
    "conflict of interest", "data availability", "funding",
    "supplementary material", "figure legends", "bibliography",
}


def _extract_sections(html: str) -> dict:
    sections: dict = {}
    body_idx = html.find("highwire-markup")
    if body_idx == -1:
        return sections
    body_html = html[body_idx:]
    last_close = body_html.rfind("</div>")
    body_content = body_html[:last_close] if last_close != -1 else body_html
    parts = re.findall(
        r"<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|$)",
        body_content,
        re.DOTALL | re.IGNORECASE,
    )
    for raw_heading, raw_content in parts:
        heading = re.sub(r"<[^>]+>", "", raw_heading).strip()
        if not heading or heading.lower() in _SKIP_SECTIONS:
            continue
        content = re.sub(r"<[^>]+>", " ", raw_content)
        content = re.sub(r"\s+", " ", content).strip()
        if content:
            sections[heading] = content
    return sections


def _parse_html(html: str, doi: str, url: str, server: str) -> Optional[dict]:
    title = None
    m = re.search(r'<meta name="citation_title" content="([^"]+)"', html)
    if m:
        title = m.group(1).strip()

    abstract = _extract_abstract(html)
    authors = re.findall(r'<meta name="citation_author" content="([^"]+)"', html)

    pub_date = None
    m = re.search(r'<meta name="citation_date" content="([^"]+)"', html)
    if m:
        pub_date = m.group(1).strip()

    m = re.search(r'<meta name="citation_doi" content="([^"]+)"', html)
    if m:
        doi = m.group(1).strip()

    journal = "bioRxiv" if server == "biorxiv" else "medRxiv"
    m = re.search(r'<meta name="citation_journal_title" content="([^"]+)"', html)
    if m:
        journal = m.group(1).strip()

    keywords = re.findall(r'<meta name="citation_keywords" content="([^"]+)"', html)
    if not keywords:
        m = re.search(r'<span class="highwire-article-collection-term">([^<]+)<', html)
        if m:
            keywords = [m.group(1).strip()]

    article_type = "Preprint"
    m = re.search(r'<span class="biorxiv-article-type">([^<]+)<', html)
    if m:
        article_type = m.group(1).strip()

    sections = _extract_sections(html)
    full_text = " ".join(sections.values()) if sections else (abstract or "")
    word_count = len(full_text.split()) if full_text else 0

    print(
        f"[PARSED] title={bool(title)} abstract={bool(abstract)} "
        f"authors={len(authors)} sections={list(sections.keys())[:4]} "
        f"words={word_count}"
    )

    if not title:
        return None

    return {
        "doi":               doi,
        "pmid":              None,
        "title":             title,
        "abstract":          abstract,
        "full_text":         full_text,
        "sections":          sections,
        "authors":           authors,
        "journal":           journal,
        "publication_date":  pub_date,
        "article_type":      article_type,
        "language":          "en",
        "keywords":          keywords,
        "mesh_terms":        [],
        "open_access":       True,
        "retracted":         False,
        "retraction_reason": None,
        "source":            server,
        "source_external_id": doi,
        "source_url":        url,
        "word_count":        word_count,
        "fetch_timestamp":   datetime.utcnow().isoformat(),
        "scraper_version":   SCRAPER_VERSION,
    }


# --------------------------------------------------------------------------- #
#  Link extraction
# --------------------------------------------------------------------------- #

def _get_article_links(html: str, server: str) -> list:
    doi_prefix = _DOI_PREFIX.get(server, "10.1101")
    doi_prefix_re = doi_prefix.replace(".", r"\.")
    pattern = rf'href="(/content/{doi_prefix_re}/[^"]+v\d+)"'
    paths = re.findall(pattern, html)
    return list(dict.fromkeys(paths))


# --------------------------------------------------------------------------- #
#  Public API
# --------------------------------------------------------------------------- #

def search_and_scrape(
    query: str,
    max_results: int = 10,
    server: str = "biorxiv",
    output_dir: str = "/home/vinni_kapoor/Brahma/brahma/ai/ingestion/output",
) -> list:
    os.makedirs(output_dir, exist_ok=True)

    base_url = f"https://www.{server}.org"
    encoded_query = query.replace(" ", "%20")
    fetch_fn = fetch_biorxiv if server == "biorxiv" else fetch_medrxiv

    results = []
    all_doi_paths = []
    page_num = 0

    # ---- Step 1: collect links -------------------------------------------- #
    while len(all_doi_paths) < max_results:
        search_url = f"{base_url}/search/{encoded_query}?page={page_num}"
        print(f"[SEARCH] {search_url}")

        html = fetch_fn(search_url, wait=2.0)
        if not html:
            print("[SEARCH] Empty response — stopping.")
            break

        links = _get_article_links(html, server)
        print(f"  Found {len(links)} articles on page {page_num}")

        if not links:
            print("[SEARCH] No more results.")
            break

        all_doi_paths.extend(links)
        all_doi_paths = list(dict.fromkeys(all_doi_paths))
        page_num += 1
        polite_sleep()

    all_doi_paths = all_doi_paths[:max_results]
    print(f"[INFO] Total articles to scrape: {len(all_doi_paths)}")

    if not all_doi_paths:
        print("[ERROR] No articles found.")
        return []

    # ---- Step 2: scrape each article -------------------------------------- #
    for doi_path in all_doi_paths:
        doi_prefix = _DOI_PREFIX.get(server, "10.1101")
        doi_prefix_re = doi_prefix.replace(".", r"\.")
        doi_match = re.search(rf"{doi_prefix_re}/[^\s\"']+", doi_path)
        if not doi_match:
            continue

        doi_id = doi_match.group(0)
        safe_id = doi_path.replace("/", "_").replace(".", "_").strip("_")
        out_path = os.path.join(output_dir, f"{server}_{safe_id}.json")

        if os.path.exists(out_path):
            print(f"[SKIP] {doi_id} already scraped")
            continue

        full_url = f"{base_url}{doi_path}.full"
        print(f"[SCRAPE] {full_url}")

        html = fetch_fn(full_url, wait=2.5)
        if not html:
            print(f"[WARN] Empty response for {doi_id}")
            continue

        article = _parse_html(html, doi_id, full_url, server)
        if not article:
            print(f"[WARN] Parse failed for {doi_id}")
            continue

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(article, f, indent=2, ensure_ascii=False)

        print(
            f"[SAVED] {os.path.basename(out_path)} | "
            f"{article['title'][:50]} | {article['word_count']} words"
        )
        results.append(article)
        polite_sleep()

    print(f"[DONE] Scraped {len(results)} articles from {server} for: {query}")
    return results
