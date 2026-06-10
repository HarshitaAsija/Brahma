import time
import random
import re
from typing import Optional
from playwright.sync_api import sync_playwright
from scrapling.parser import Selector
from ai.ingestion.scrapers.base import RawArticle

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

def _extract_full_text(html: str) -> Optional[str]:
    """Extract full article body text using last closing section tag."""
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
    doc = Selector(html)

    # Title
    title = None
    title_meta = re.search(r'<meta name="citation_title" content="([^"]+)"', html)
    if title_meta:
        title = title_meta.group(1).strip()
    else:
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
    else:
        for a in doc.find_all("a"):
            href = a.attrib.get("href", "")
            if "doi.org" in href:
                doi = href.replace("https://doi.org/", "").strip()
                break

    # Authors
    authors = re.findall(r'<meta name="citation_author" content="([^"]+)"', html)

    # Publication date
    pub_date = None
    date_meta = re.search(r'<meta name="citation_date" content="([^"]+)"', html)
    if date_meta:
        pub_date = date_meta.group(1).strip()
    else:
        date_match = re.search(r"Collection date (\d{4})", html)
        if date_match:
            pub_date = date_match.group(1)

    # Journal
    journal = None
    journal_meta = re.search(r'<meta name="citation_journal_title" content="([^"]+)"', html)
    if journal_meta:
        journal = journal_meta.group(1).strip()

    # Keywords
    keywords = re.findall(r'<meta name="citation_keywords" content="([^"]+)"', html)
    if not keywords:
        kw_matches = re.findall(r'class=["\']kwd-text["\'][^>]*>(.*?)</', html)
        keywords = [re.sub(r"<[^>]+>", "", kw).strip() for kw in kw_matches if kw.strip()]

    # Full text
    full_text = _extract_full_text(html)

    print(f"[PARSED] title={bool(title)} abstract={bool(abstract)} authors={len(authors)} doi={bool(doi)} date={pub_date} journal={journal} full_text_words={len(full_text.split()) if full_text else 0}")

    return RawArticle(
        source="pmc",
        url=url,
        title=title,
        abstract=abstract,
        authors=authors,
        pub_date=pub_date,
        doi=doi,
        pmc_id=pmc_id,
        full_text=full_text,
        keywords=keywords,
        raw_html=html
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
    """Parse from saved HTML file - for testing without hitting PMC."""
    with open(filepath, "r") as f:
        html = f.read()
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/"
    return _parse_pmc_html(html, pmc_id, url)
