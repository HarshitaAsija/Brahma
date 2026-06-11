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
    time.sleep(random.uniform(3.0, 5.0))

def _decode(s):
    return s.replace("&amp;","&").replace("&lt;","<").replace("&gt;",">").replace("&#39;","'")

def _parse_pubmed_html(html: str, pmid: str, url: str) -> Optional[dict]:

    title = None
    title_meta = re.search(r'<meta name="citation_title" content="([^"]+)"', html)
    if title_meta:
        title = title_meta.group(1).strip()

    authors_raw = re.findall(r'class="full-name"[^>]*>([^<]+)<', html)
    authors = list(dict.fromkeys(authors_raw))

    pmid_meta = re.search(r'<meta name="citation_pmid" content="([^"]+)"', html)
    if pmid_meta:
        pmid = pmid_meta.group(1).strip()

    doi = None
    doi_meta = re.search(r'<meta name="citation_doi" content="([^"]+)"', html)
    if doi_meta:
        doi = doi_meta.group(1).strip()

    journal = None
    journal_meta = re.search(r'<meta name="citation_journal_title" content="([^"]+)"', html)
    if journal_meta:
        journal = journal_meta.group(1).strip()

    pub_date = None
    date_meta = re.search(r'<meta name="citation_date" content="([^"]+)"', html)
    if date_meta:
        pub_date = date_meta.group(1).strip()

    abstract = None
    abstract_idx = html.find("abstract-content selected")
    if abstract_idx > -1:
        chunk = html[abstract_idx:abstract_idx+5000]
        paras = re.findall(r"<p>(.*?)</p>", chunk, re.DOTALL)
        parts = []
        for p in paras:
            clean = re.sub(r"<[^>]+>", " ", p)
            clean = re.sub(r"\s+", " ", clean).strip()
            if clean:
                parts.append(clean)
        abstract = " ".join(parts) if parts else None

    mesh_terms = []
    mesh_idx = html.find('id="mesh-terms"')
    if mesh_idx > -1:
        mesh_chunk = html[mesh_idx:mesh_idx+5000]
        raw_mesh = re.findall(
            r'class="keyword-actions-trigger[^"]*"[^>]*>\s*([^<]+?)\s*</button>',
            mesh_chunk
        )
        mesh_terms = [_decode(m.strip()) for m in raw_mesh if m.strip()]

    keywords = []
    kw_idx = html.find('id="keywords"')
    if kw_idx > -1:
        kw_chunk = html[kw_idx:kw_idx+2000]
        raw_kw = re.findall(
            r'class="keyword-actions-trigger[^"]*"[^>]*>\s*([^<]+?)\s*</button>',
            kw_chunk
        )
        keywords = [_decode(k.strip()) for k in raw_kw if k.strip()]

    article_type = None
    pub_idx = html.find('id="publication-types"')
    if pub_idx > -1:
        pub_chunk = html[pub_idx:pub_idx+1000]
        pub_types = re.findall(
            r'class="keyword-actions-trigger[^"]*"[^>]*>\s*([^<]+?)\s*</button>',
            pub_chunk
        )
        if pub_types:
            article_type = _decode(pub_types[0].strip())

    language = "en"
    lang_meta = re.search(r'<meta name="citation_language" content="([^"]+)"', html)
    if lang_meta:
        language = lang_meta.group(1).strip()

    print(f"[PARSED] title={bool(title)} abstract={bool(abstract)} authors={len(authors)} doi={bool(doi)} mesh={len(mesh_terms)} type={article_type}")

    return {
        "doi": doi,
        "pmid": pmid,
        "title": title,
        "abstract": abstract,
        "full_text": None,
        "sections": {},
        "authors": authors,
        "journal": journal,
        "publication_date": pub_date,
        "article_type": article_type,
        "language": language,
        "keywords": keywords,
        "mesh_terms": mesh_terms,
        "open_access": False,
        "retracted": False,
        "retraction_reason": None,
        "source": "pubmed",
        "source_external_id": pmid,
        "source_url": url,
        "fetch_timestamp": datetime.utcnow().isoformat(),
        "scraper_version": SCRAPER_VERSION,
    }

def scrape_pubmed_article(pmid: str, page=None, output_dir: str = "ai/ingestion/output") -> Optional[dict]:
    url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
    os.makedirs(output_dir, exist_ok=True)
    out_path = f"{output_dir}/pubmed_{pmid}.json"

    if os.path.exists(out_path):
        print(f"[SKIP] {pmid} already scraped")
        with open(out_path) as f:
            return json.load(f)

    close_browser = False
    browser_obj = None
    playwright_obj = None

    if page is None:
        playwright_obj = sync_playwright().start()
        browser_obj = playwright_obj.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=False,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"]
        )
        context = browser_obj.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            viewport={"width":1920,"height":1080},
        )
        context.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined})"
        )
        page = context.new_page()
        close_browser = True

    try:
        print(f"[SCRAPE] {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        time.sleep(random.uniform(2.0, 3.0))
        html = page.content()
    except Exception as e:
        print(f"[ERROR] {pmid}: {e}")
        return None
    finally:
        if close_browser:
            if browser_obj:
                browser_obj.close()
            if playwright_obj:
                playwright_obj.stop()

    article = _parse_pubmed_html(html, pmid, url)
    if not article:
        return None

    with open(out_path, "w") as f:
        json.dump(article, f, indent=2, ensure_ascii=False)

    print(f"[SAVED] pubmed_{pmid}.json")
    return article

def search_and_scrape(query: str, max_results: int = 10, output_dir: str = "ai/ingestion/output") -> list:
    os.makedirs(output_dir, exist_ok=True)
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=False,
            args=["--no-sandbox","--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            viewport={"width":1920,"height":1080},
        )
        context.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined})"
        )
        page = context.new_page()

        search_url = f"https://pubmed.ncbi.nlm.nih.gov/?term={query.replace(chr(32),chr(43))}"
        print(f"[SEARCH] {search_url}")
        page.goto(search_url, wait_until="networkidle", timeout=30000)
        time.sleep(3)
        html = page.content()

        pmids = re.findall(r'href="/(\d{7,9})/"', html)
        pmids = list(dict.fromkeys(pmids))[:max_results]
        print(f"[SEARCH] Found {len(pmids)} articles: {pmids}")

        if not pmids:
            print("[ERROR] No results found")
            browser.close()
            return []

        for pmid in pmids:
            article = scrape_pubmed_article(pmid, page=page, output_dir=output_dir)
            if article:
                results.append(article)
            _polite_sleep()

        browser.close()

    print(f"[DONE] Scraped {len(results)} PubMed articles for: {query}")
    return results
