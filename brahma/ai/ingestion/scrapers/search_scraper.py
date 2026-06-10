import time
import random
import re
import json
import os
from typing import Optional
from playwright.sync_api import sync_playwright
from ai.ingestion.scrapers.pmc_scraper import _is_captcha, _parse_pmc_html
from ai.ingestion.scrapers.base import RawArticle

CHROMIUM_PATH = "/snap/bin/chromium"

def _polite_sleep():
    time.sleep(random.uniform(3.0, 5.0))

def search_and_scrape(query: str, max_results: int = 10, output_dir: str = "ai/ingestion/output") -> list:
    """
    Full pipeline in ONE browser session:
    1. Search PubMed for query
    2. For each result, find PMC ID
    3. Scrape full text from PMC
    4. Save each article as JSON
    """
    os.makedirs(output_dir, exist_ok=True)
    results = []

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

        # Step 1 — Search PubMed
        search_url = f"https://pubmed.ncbi.nlm.nih.gov/?term={query.replace(' ', '+')}&filter=simsearch1.fha&filter=pubt.clinicaltrial"
        print(f"[SEARCH] {search_url}")
        page.goto(search_url, wait_until="networkidle", timeout=30000)
        time.sleep(3)
        search_html = page.content()

        pubmed_ids = re.findall(r'href="/(\d{7,9})/"', search_html)
        pubmed_ids = list(dict.fromkeys(pubmed_ids))[:max_results]
        print(f"[SEARCH] Found {len(pubmed_ids)} articles: {pubmed_ids}")

        if not pubmed_ids:
            print("[ERROR] No results — may need CAPTCHA solve")
            browser.close()
            return []

        # Step 2 — Get PMC IDs from PubMed pages
        pmc_ids = []
        for pid in pubmed_ids:
            url = f"https://pubmed.ncbi.nlm.nih.gov/{pid}/"
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(random.uniform(1.5, 2.5))
                html = page.content()
                pmc_matches = re.findall(r"pmc\.ncbi\.nlm\.nih\.gov/articles/(PMC\d+)", html)
                if pmc_matches:
                    pmc_id = pmc_matches[0]
                    print(f"  [FOUND] PubMed {pid} -> {pmc_id}")
                    pmc_ids.append(pmc_id)
                else:
                    print(f"  [SKIP] PubMed {pid} has no free PMC full text")
            except Exception as e:
                print(f"  [ERROR] {pid}: {e}")
            _polite_sleep()

        print(f"[INFO] {len(pmc_ids)} articles have PMC full text")

        # Step 3 — Scrape PMC articles in SAME browser session
        for pmc_id in pmc_ids:
            out_path = f"{output_dir}/{pmc_id}.json"
            if os.path.exists(out_path):
                print(f"[SKIP] {pmc_id} already scraped")
                continue

            url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/"
            print(f"[SCRAPE] {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(random.uniform(2.0, 3.0))
                html = page.content()
            except Exception as e:
                print(f"[ERROR] {pmc_id}: {e}")
                continue

            if _is_captcha(html):
                print(f"[CAPTCHA] {pmc_id} — solve in browser then press ENTER")
                input()
                html = page.content()

            if _is_captcha(html):
                print(f"[WARN] Still CAPTCHA — skipping {pmc_id}")
                continue

            article = _parse_pmc_html(html, pmc_id, url)
            if not article:
                print(f"[WARN] Parse failed for {pmc_id}")
                continue

            output = {
                "source": article.source,
                "url": article.url,
                "pmc_id": article.pmc_id,
                "title": article.title,
                "abstract": article.abstract,
                "authors": article.authors,
                "pub_date": article.pub_date,
                "doi": article.doi,
                "keywords": article.keywords,
                "full_text": article.full_text,
            }
            with open(out_path, "w") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)

            words = len(article.full_text.split()) if article.full_text else 0
            print(f"[SAVED] {pmc_id}.json — title: {article.title[:50] if article.title else 'N/A'} | words: {words}")
            results.append(output)
            _polite_sleep()

        browser.close()

    print(f"[DONE] Scraped {len(results)} articles for: {query}")
    return results
