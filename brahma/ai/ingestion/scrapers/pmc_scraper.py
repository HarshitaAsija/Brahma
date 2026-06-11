import time
import random
import re
from typing import Optional
from datetime import datetime
from playwright.sync_api import sync_playwright
from scrapling.parser import Selector
from ai.ingestion.scrapers.base import RawArticle, SCRAPER_VERSION

CHROMIUM_PATH = "/snap/bin/chromium"

def _polite_sleep():
    time.sleep(random.uniform(3.0, 6.0))

def _get_page_html(url: str) -> Optional[str]:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=False,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="en-US",
        )
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        page = context.new_page()
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            time.sleep(random.uniform(2.0, 3.0))
            html = page.content()
            return html
        except Exception as e:
            print(f"[ERROR] Failed to load {url}: {e}")
            return None
        finally:
            browser.close()

def _is_captcha(html: str) -> bool:
    title = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
    if title:
        t = title.group(1).lower()
        return "recaptcha" in t or "checking your browser" in t
    return False

def _extract_sections(html: str) -> dict:
    """Extract structured sections from PMC article body."""
    sections = {}
    body_idx = html.find("body main-article-body")
    if body_idx == -1:
        return sections

    tag_start = html.rfind("<", 0, body_idx)
    body_html = html[tag_start:]
    last_close = body_html.rfind("</section>")
    if last_close == -1:
        return sections
    body_content = body_html[:last_close]

    # Find all h2 section headings and their content
    section_pattern = re.findall(
        r"<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|$)",
        body_content, re.DOTALL | re.IGNORECASE
    )
    for heading, content in section_pattern:
        heading_clean = re.sub(r"<[^>]+>", "", heading).strip()
        content_clean = re.sub(r"<[^>]+>", " ", content)
        content_clean = re.sub(r"\s+", " ", content_clean).strip()
        if heading_clean and content_clean:
            sections[heading_clean] = content_clean

    return sections

def _extract_full_text(html: str) -> Optional[str]:
    body_idx = html.find("body main-article-body")
    if body_idx == -1:
        return None
    tag_start = html.rfind("<", 0, body_idx)
    body_html = html[tag_start:]
    last_close = body_html.rfind("</section>")
    if last_close == -1:
        return None
    body_content = body_html[:last_close]
    full_text = re.sub(r"<[^>]+>", " ", body_content)
    full_text = re.sub(r"\s+", " ", full_text).strip()
    return full_text

def _parse_pmc_html(html: str, pmc_id: str, url: str) -> Optional[RawArticle]:
    # Title
    title = None
    title_meta = re.search(r'<meta name="citation_title" content="([^"]+)"', html)
    if title_meta:
        title = title_meta.group(1).strip()
    else:
        doc = Selector(html)
        for h in doc.find_all("h1"):
            t = h.text.strip()
            if t:
                title = t
                break

    # Abstract
    abstract = None
    ab_match = re.search(r'id=["\']abstract\d+["\'].*?<p>(.*?)</p>', html, re.DOTALL)
    if ab_match:
        abstract = re.sub(r"<[^>]+>", "", ab_match.group(1)).strip()

    # DOI
    doi = None
    doi_meta = re.search(r'<meta name="citation_doi" content="([^"]+)"', html)
    if doi_meta:
        doi = doi_meta.group(1).strip()

    # Authors
    authors = re.findall(r'<meta name="citation_author" content="([^"]+)"', html)

    # Journal
    journal = None
    journal_meta = re.search(r'<meta name="citation_journal_title" content="([^"]+)"', html)
    if journal_meta:
        journal = journal_meta.group(1).strip()

    # Publication date
    pub_date = None
    date_meta = re.search(r'<meta name="citation_date" content="([^"]+)"', html)
    if date_meta:
        pub_date = date_meta.group(1).strip()

    # Keywords — author provided
    keywords = re.findall(r'<meta name="citation_keywords" content="([^"]+)"', html)
    if not keywords:
        kw_matches = re.findall(r'class=["\']kwd-text["\'][^>]*>(.*?)</', html)
        keywords = [re.sub(r"<[^>]+>", "", kw).strip() for kw in kw_matches if kw.strip()]

    # MeSH terms
    mesh_terms = re.findall(r'<a[^>]*mesh[^>]*>([^<]+)</a>', html, re.IGNORECASE)

    # Article type
    article_type = None
    atype = re.search(r'<meta name="citation_article_type" content="([^"]+)"', html)
    if atype:
        article_type = atype.group(1).strip()

    # Language
    language = "en"
    lang = re.search(r'<meta name="citation_language" content="([^"]+)"', html)
    if lang:
        language = lang.group(1).strip()

    # Structured sections
    sections = _extract_sections(html)

    # Full text
    full_text = _extract_full_text(html)

    print(f"[PARSED] title={bool(title)} abstract={bool(abstract)} authors={len(authors)} journal={journal} sections={list(sections.keys())[:4]} words={len(full_text.split()) if full_text else 0}")

    return RawArticle(
        source="pmc",
        source_url=url,
        source_external_id=pmc_id,
        doi=doi,
        pmid=None,
        title=title,
        abstract=abstract,
        full_text=full_text,
        sections=sections,
        authors=authors,
        journal=journal,
        publication_date=pub_date,
        article_type=article_type,
        language=language,
        keywords=keywords,
        mesh_terms=mesh_terms,
        open_access=True,
        retracted=False,
        retraction_reason=None,
        fetch_timestamp=datetime.utcnow().isoformat(),
        scraper_version=SCRAPER_VERSION,
        raw_html=html,
    )

def scrape_pmc_article(pmc_id: str) -> Optional[RawArticle]:
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/"
    print(f"[INFO] Fetching {url}")
    html = _get_page_html(url)
    if not html:
        return None
    if _is_captcha(html):
        print("[WARN] Got CAPTCHA - skipping")
        return None
    article = _parse_pmc_html(html, pmc_id, url)
    _polite_sleep()
    return article

def parse_from_file(filepath: str, pmc_id: str) -> Optional[RawArticle]:
    with open(filepath, "r") as f:
        html = f.read()
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/"
    return _parse_pmc_html(html, pmc_id, url)
