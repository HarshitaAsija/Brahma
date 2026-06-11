import time
import random
import re
import json
import os
from typing import Optional
from datetime import datetime
from playwright.sync_api import sync_playwright
from ai.ingestion.scrapers.base import SCRAPER_VERSION

CHROMIUM_PATH = "/snap/bin/chromium"

def _polite_sleep():
    time.sleep(random.uniform(2.0, 4.0))

def _decode_html(raw: str) -> str:
    raw = raw.replace("&lt;","<").replace("&gt;",">").replace("&amp;","&").replace("&#39;","'").replace("&quot;",'"')
    return re.sub(r"<[^>]+>","",raw).strip()

def _extract_abstract(html: str) -> Optional[str]:
    """Extract abstract from bioRxiv/medRxiv article."""
    idx = html.find("abstract-1")
    if idx > -1:
        chunk = html[idx:idx+3000]
        chunk = re.sub(r"<h2[^>]*>.*?</h2>","",chunk,flags=re.DOTALL)
        p_match = re.search(r"<p[^>]*>(.*?)</p>",chunk,re.DOTALL)
        if p_match:
            abstract = re.sub(r"<[^>]+>"," ",p_match.group(1))
            return re.sub(r"\s+"," ",abstract).strip()
    ab_meta = re.search(r'name="abstract"[^>]*content="([^"]+)"',html)
    if ab_meta:
        return _decode_html(ab_meta.group(1))
    return None

def _extract_sections(html: str) -> dict:
    """Extract structured sections separated by H2 headings."""
    sections = {}
    body_idx = html.find("highwire-markup")
    if body_idx == -1:
        return sections
    body_html = html[body_idx:]
    last_close = body_html.rfind("</div>")
    body_content = body_html[:last_close]

    skip = {"references","acknowledgements","footnotes","subject area",
            "follow this preprint","citation manager formats","share this article"}

    section_parts = re.findall(
        r"<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|$)",
        body_content, re.DOTALL|re.IGNORECASE
    )
    for heading, content in section_parts:
        heading_clean = re.sub(r"<[^>]+>","",heading).strip()
        if heading_clean.lower() in skip:
            continue
        content_clean = re.sub(r"<[^>]+>"," ",content)
        content_clean = re.sub(r"\s+"," ",content_clean).strip()
        if heading_clean and content_clean:
            sections[heading_clean] = content_clean
    return sections

def _parse_biorxiv_html(html: str, doi: str, url: str, server: str = "biorxiv") -> Optional[dict]:
    # Title
    title = None
    title_meta = re.search(r'<meta name="citation_title" content="([^"]+)"',html)
    if title_meta:
        title = title_meta.group(1).strip()

    # Abstract
    abstract = _extract_abstract(html)

    # Authors
    authors = re.findall(r'<meta name="citation_author" content="([^"]+)"',html)

    # Date
    pub_date = None
    date_meta = re.search(r'<meta name="citation_date" content="([^"]+)"',html)
    if date_meta:
        pub_date = date_meta.group(1).strip()

    # DOI
    doi_meta = re.search(r'<meta name="citation_doi" content="([^"]+)"',html)
    if doi_meta:
        doi = doi_meta.group(1).strip()

    # Journal
    journal = "bioRxiv" if server == "biorxiv" else "medRxiv"
    journal_meta = re.search(r'<meta name="citation_journal_title" content="([^"]+)"',html)
    if journal_meta:
        journal = journal_meta.group(1).strip()

    # Keywords
    keywords = re.findall(r'<meta name="citation_keywords" content="([^"]+)"',html)
    if not keywords:
        subject = re.search(r'<span class="highwire-article-collection-term">([^<]+)<',html)
        if subject:
            keywords = [subject.group(1).strip()]

    # Article type
    article_type = "Preprint"
    atype = re.search(r'<span class="biorxiv-article-type">([^<]+)<',html)
    if atype:
        article_type = atype.group(1).strip()

    # Structured sections
    sections = _extract_sections(html)

    # Full text — all sections merged
    full_text = " ".join(sections.values()) if sections else None

    print(f"[PARSED] title={bool(title)} abstract={bool(abstract)} authors={len(authors)} sections={list(sections.keys())[:4]} words={len(full_text.split()) if full_text else 0}")

    return {
        "doi": doi,
        "pmid": None,
        "title": title,
        "abstract": abstract,
        "full_text": full_text,
        "sections": sections,
        "authors": authors,
        "journal": journal,
        "publication_date": pub_date,
        "article_type": article_type,
        "language": "en",
        "keywords": keywords,
        "mesh_terms": [],
        "open_access": True,
        "retracted": False,
        "retraction_reason": None,
        "source": server,
        "source_external_id": doi,
        "source_url": url,
        "fetch_timestamp": datetime.utcnow().isoformat(),
        "scraper_version": SCRAPER_VERSION,
    }

def _get_article_links_from_page(html: str) -> list:
    doi_paths = re.findall(r'href="(/content/10\.1101/[\d.]+v\d+)"',html)
    return list(dict.fromkeys(doi_paths))

def search_and_scrape(query: str, max_results: int = 10, server: str = "biorxiv", output_dir: str = "ai/ingestion/output") -> list:
    os.makedirs(output_dir, exist_ok=True)
    results = []
    base_url = f"https://www.{server}.org"

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=False,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            viewport={"width":1920,"height":1080},
            locale="en-US",
        )
        context.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined})"
        )
        page = context.new_page()

        # Step 1 — collect article links across pages
        all_doi_paths = []
        page_num = 0
        encoded_query = query.replace(" ","%20")

        while len(all_doi_paths) < max_results:
            search_url = f"{base_url}/search/{encoded_query}?page={page_num}"
            print(f"[SEARCH] {search_url}")
            page.goto(search_url, wait_until="networkidle", timeout=30000)
            time.sleep(3)
            html = page.content()
            links = _get_article_links_from_page(html)
            print(f"  Found {len(links)} articles on page {page_num}")
            if not links:
                print("[INFO] No more results")
                break
            all_doi_paths.extend(links)
            all_doi_paths = list(dict.fromkeys(all_doi_paths))
            page_num += 1
            _polite_sleep()

        all_doi_paths = all_doi_paths[:max_results]
        print(f"[INFO] Total articles to scrape: {len(all_doi_paths)}")

        if not all_doi_paths:
            print("[ERROR] No articles found")
            browser.close()
            return []

        # Step 2 — scrape each article
        for doi_path in all_doi_paths:
            doi_match = re.search(r"10\.1101/[\d.]+",doi_path)
            if not doi_match:
                continue
            doi_id = doi_match.group(0)
            safe_id = doi_id.replace("/","_").replace(".","_")
            out_path = f"{output_dir}/{server}_{safe_id}.json"

            if os.path.exists(out_path):
                print(f"[SKIP] {doi_id} already scraped")
                continue

            full_url = f"{base_url}{doi_path}.full"
            print(f"[SCRAPE] {full_url}")
            try:
                page.goto(full_url, wait_until="networkidle", timeout=30000)
                time.sleep(random.uniform(2.0,3.0))
                html = page.content()
            except Exception as e:
                print(f"[ERROR] {doi_id}: {e}")
                continue

            article = _parse_biorxiv_html(html, doi_id, full_url, server)
            if not article or not article["title"]:
                print(f"[WARN] Parse failed for {doi_id}")
                continue

            with open(out_path,"w") as f:
                json.dump(article, f, indent=2, ensure_ascii=False)

            words = len(article["full_text"].split()) if article["full_text"] else 0
            print(f"[SAVED] {out_path} | {article['title'][:50]} | {words} words")
            results.append(article)
            _polite_sleep()

        browser.close()

    print(f"[DONE] Scraped {len(results)} articles from {server} for: {query}")
    return results
