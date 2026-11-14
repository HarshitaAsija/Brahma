"""
bioRxiv / medRxiv scraper for BRAHMA.
- bioRxiv: uses standard requests HTTP
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
#  Standard requests fetcher for bioRxiv
# --------------------------------------------------------------------------- #

def fetch_biorxiv(url: str, wait: float = 2.0) -> str:
    try:
        r = requests.get(url, headers=_HEADERS, timeout=30)
        if r.status_code == 200:
            time.sleep(wait + random.uniform(0.5, 1.5))
            return r.text
        print(f"[FETCH] HTTP {r.status_code} for {url}")
        return ""
    except Exception as e:
        print(f"[FETCH] Error: {e}")
        return ""


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
    """Search Europe PMC for bioRxiv/medRxiv preprints and save results."""
    if server not in _DOI_PREFIX:
        raise ValueError(f"Unsupported preprint server: {server}")

    os.makedirs(output_dir, exist_ok=True)
    results = []

    doi_prefix = _DOI_PREFIX[server]
    api_url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    api_query = f'SRC:PPR AND DOI:{doi_prefix}* AND ({query})'

    print(f"[SEARCH] Europe PMC: {api_query}")

    try:
        response = requests.get(
            api_url,
            params={
                "query": api_query,
                "format": "json",
                "resultType": "core",
                "pageSize": min(max_results, 100),
            },
            headers=_HEADERS,
            timeout=30,
        )
        response.raise_for_status()
        papers = response.json().get("resultList", {}).get("result", [])
    except Exception as e:
        print(f"[SEARCH] Europe PMC error: {e}")
        return []

    print(f"[INFO] Found {len(papers)} matching records from {server}")

    for paper in papers[:max_results]:
        doi = paper.get("doi", "")
        if not doi.startswith(doi_prefix + "/"):
            continue

        safe_id = doi.replace("/", "_").replace(".", "_")
        out_path = os.path.join(output_dir, f"{server}_{safe_id}.json")

        if os.path.exists(out_path):
            print(f"[SKIP] {doi} already scraped")
            continue

        title = _decode_html(paper.get("title") or "")
        abstract = _decode_html(paper.get("abstractText") or "")

        author_list = paper.get("authorList", {}).get("author", [])
        authors = [
            a.get("fullName", "").strip()
            for a in author_list
            if a.get("fullName")
        ]

        if not authors and paper.get("authorString"):
            authors = [
                name.strip()
                for name in paper["authorString"].split(",")
                if name.strip()
            ]

        pub_date = paper.get("firstPublicationDate")
        source_url = f"https://doi.org/{doi}"
        sections = {}
        full_text = abstract

        # Use Europe PMC hosted full text when it is available.
        links = paper.get("fullTextUrlList", {}).get("fullTextUrl", [])
        html_link = next(
            (
                link.get("url")
                for link in links
                if link.get("site") == "Europe_PMC"
                and link.get("documentStyle") == "html"
                and link.get("url")
            ),
            None,
        )

        if html_link:
            try:
                article_response = requests.get(
                    html_link, headers=_HEADERS, timeout=30
                )
                if article_response.status_code == 200:
                    parsed = _parse_html(
                        article_response.text, doi, html_link, server
                    )
                    if parsed:
                        sections = parsed.get("sections", {})
                        full_text = parsed.get("full_text") or abstract
                        title = parsed.get("title") or title
                        abstract = parsed.get("abstract") or abstract
                        authors = parsed.get("authors") or authors
                        pub_date = parsed.get("publication_date") or pub_date
                        source_url = html_link
            except Exception as e:
                print(f"[WARN] Full-text retrieval failed for {doi}: {e}")

        if abstract and not sections:
            sections = {"Abstract": abstract}

        word_count = len(full_text.split()) if full_text else 0

        article = {
            "doi": doi,
            "pmid": None,
            "title": title,
            "abstract": abstract,
            "full_text": full_text,
            "sections": sections,
            "authors": authors,
            "journal": server,
            "publication_date": pub_date,
            "article_type": "Preprint",
            "language": "en",
            "keywords": [],
            "mesh_terms": [],
            "open_access": True,
            "retracted": False,
            "retraction_reason": None,
            "source": server,
            "source_external_id": doi,
            "source_url": source_url,
            "word_count": word_count,
            "fetch_timestamp": datetime.utcnow().isoformat(),
            "scraper_version": SCRAPER_VERSION,
        }

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(article, f, indent=2, ensure_ascii=False)

        print(
            f"[SAVED] {os.path.basename(out_path)} | "
            f"{title[:50]} | {word_count} words"
        )
        results.append(article)
        time.sleep(random.uniform(0.5, 1.0))

    print(f"[DONE] Scraped {len(results)} records from {server} for: {query}")
    return results
