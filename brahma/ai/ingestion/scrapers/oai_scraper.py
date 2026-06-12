import time
import re
import json
import os
import requests
from datetime import datetime
from typing import Optional
from ai.ingestion.scrapers.base import SCRAPER_VERSION

OAI_BASE = "https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi"

def _get_tag(tag, text):
    m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", text, re.DOTALL)
    return m.group(1).strip() if m else None

def _parse_oai_record(record_xml):
    title = _get_tag("article-title", record_xml)
    if not title:
        return None
    title = re.sub(r"<[^>]+>", "", title).strip()

    abstract_match = re.search(r"<abstract[^>]*>(.*?)</abstract>", record_xml, re.DOTALL)
    abstract = re.sub(r"<[^>]+>", " ", abstract_match.group(1)).strip() if abstract_match else None

    authors = re.findall(r"<surname>(.*?)</surname>.*?<given-names>(.*?)</given-names>", record_xml, re.DOTALL)
    author_list = [f"{g.strip()} {s.strip()}" for s, g in authors]

    doi = None
    m = re.search(r'pub-id-type="doi"[^>]*>(.*?)</article-id>', record_xml)
    if not m:
        m = re.search(r"pub-id-type='doi'[^>]*>(.*?)</article-id>", record_xml)
    if m:
        doi = m.group(1).strip()

    pmid = None
    m = re.search(r'pub-id-type="pmid"[^>]*>(.*?)</article-id>', record_xml)
    if m:
        pmid = m.group(1).strip()

    pmc_id = None
    m = re.search(r'pub-id-type="pmc"[^>]*>(.*?)</article-id>', record_xml)
    if m:
        pmc_id = "PMC" + m.group(1).strip()

    journal = _get_tag("journal-title", record_xml)

    pub_date = None
    year = re.search(r"<year>(\d{4})</year>", record_xml)
    month = re.search(r"<month>(\d{1,2})</month>", record_xml)
    if year:
        pub_date = f"{year.group(1)}-{month.group(1).zfill(2)}-01" if month else f"{year.group(1)}-01-01"

    keywords = re.findall(r"<kwd>(.*?)</kwd>", record_xml)
    mesh_terms = re.findall(r"<descriptor[^>]*>(.*?)</descriptor>", record_xml)

    full_text_paragraphs = re.findall(r"<p>(.*?)</p>", record_xml, re.DOTALL)
    full_text = " ".join(re.sub(r"<[^>]+>", "", p).strip() for p in full_text_paragraphs)

    return {
        "doi": doi,
        "pmid": pmid,
        "title": title,
        "abstract": abstract,
        "full_text": full_text or None,
        "sections": {},
        "authors": author_list,
        "journal": journal,
        "publication_date": pub_date,
        "article_type": "Journal Article",
        "language": "en",
        "keywords": keywords,
        "mesh_terms": mesh_terms,
        "open_access": True,
        "retracted": False,
        "retraction_reason": None,
        "source": "pmc_oai",
        "source_external_id": pmc_id or "",
        "source_url": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/" if pmc_id else "",
        "fetch_timestamp": datetime.utcnow().isoformat(),
        "scraper_version": SCRAPER_VERSION,
    }

def harvest_pmc_oai(from_date, until_date, max_records=10,
                    output_dir="ai/ingestion/output/oai"):
    """
    F4 - PMC OAI-PMH Harvester.
    Bulk fetches papers by date range via PMC official data feed.
    No browser needed - pure HTTP requests.
    from_date, until_date: YYYY-MM-DD
    """
    os.makedirs(output_dir, exist_ok=True)
    results = []

    params = {
        "verb": "ListRecords",
        "metadataPrefix": "pmc",
        "from": from_date,
        "until": until_date,
    }

    page = 0
    while len(results) < max_records:
        print(f"[OAI] Fetching page {page} ({len(results)}/{max_records} so far)...")
        try:
            response = requests.get(OAI_BASE, params=params, timeout=30)
            xml = response.text
        except Exception as e:
            print(f"[ERROR] {e}")
            break

        records = re.findall(r"<record>(.*?)</record>", xml, re.DOTALL)
        print(f"[OAI] Got {len(records)} records on page {page}")

        if not records:
            print("[OAI] No records found - check date range")
            break

        for rec in records:
            if len(results) >= max_records:
                break
            article = _parse_oai_record(rec)
            if article and article["title"]:
                fname = re.sub(r"[^a-z0-9]", "_", article["title"][:40].lower()) + ".json"
                fpath = os.path.join(output_dir, fname)
                with open(fpath, "w", encoding="utf-8") as f:
                    json.dump(article, f, indent=2, ensure_ascii=False)
                results.append(article)
                print(f"[SAVED] {fname} | {article['title'][:50]}")

        token = re.search(r"<resumptionToken[^>]*>(.*?)</resumptionToken>", xml)
        if not token or not token.group(1).strip():
            print("[OAI] No more pages.")
            break

        params = {"verb": "ListRecords", "resumptionToken": token.group(1).strip()}
        page += 1
        time.sleep(1)

    print(f"[DONE] Harvested {len(results)} articles")
    return results
