# NCBI E-utilities based PubMed scraper — no browser, no CAPTCHA
# Get free API key: https://www.ncbi.nlm.nih.gov/account/
NCBI_API_KEY = None

import asyncio
import httpx
import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime
from ai.ingestion.scrapers.base import SCRAPER_VERSION
from ai.ingestion.scrapers.pmc_scraper import run_pmc

BASE_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
BASE_FETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

async def _get_pmids(query: str, max_results: int, client: httpx.AsyncClient) -> list:
    params = {
        "db": "pubmed", "term": query,
        "retmax": max_results, "retmode": "json",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    try:
        resp = await client.get(BASE_SEARCH, params=params)
        resp.raise_for_status()
        ids = resp.json()["esearchresult"]["idlist"]
        print(f"  [PubMed] Found {len(ids)} articles for: {query}")
        return ids
    except Exception as e:
        print(f"  [PubMed] Search error: {e}")
        return []

async def _fetch_pubmed_batch(pmids: list, client: httpx.AsyncClient) -> list:
    params = {
        "db": "pubmed", "id": ",".join(pmids),
        "retmode": "xml", "rettype": "abstract",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    for attempt in range(3):
        try:
            resp = await client.get(BASE_FETCH, params=params)
            resp.raise_for_status()
            break
        except Exception as e:
            if attempt == 2:
                print(f"  [PubMed] Batch fetch failed: {e}")
                return []
            await asyncio.sleep(2 ** attempt)

    root = ET.fromstring(resp.text)
    papers = []

    for article in root.findall(".//PubmedArticle"):
        try:
            pmid = article.findtext(".//PMID", "")

            title_el = article.find(".//ArticleTitle")
            title = "".join(title_el.itertext()).strip() if title_el is not None else ""

            abstract_els = article.findall(".//AbstractText")
            abstract = " ".join(
                "".join(el.itertext()) for el in abstract_els
            ).strip()

            authors = []
            for a in article.findall(".//Author"):
                last  = a.findtext("LastName", "")
                first = a.findtext("ForeName", "")
                name  = f"{first} {last}".strip()
                if name:
                    authors.append(name)

            journal = article.findtext(".//Journal/Title", "")

            doi = ""
            for id_el in article.findall(".//ArticleId"):
                if id_el.get("IdType") == "doi":
                    doi = id_el.text or ""

            year  = article.findtext(".//PubDate/Year", "")
            month = article.findtext(".//PubDate/Month", "")
            pub_date = f"{year}-{month}".strip("-") if year else ""

            keywords = [
                kw.text.strip()
                for kw in article.findall(".//Keyword")
                if kw.text
            ]

            mesh_terms = [
                article.findtext(".//DescriptorName", "")
                for m in article.findall(".//MeshHeading")
                if article.findtext(".//DescriptorName", "")
            ]

            article_type = ""
            pt = article.find(".//PublicationType")
            if pt is not None:
                article_type = pt.text or ""

            word_count = len(abstract.split()) if abstract else 0

            print(f"    ✓ {title[:70]}")

            papers.append({
                "doi":              doi,
                "pmid":             pmid,
                "title":            title,
                "abstract":         abstract,
                "full_text":        abstract,
                "sections":         {},
                "authors":          authors,
                "journal":          journal,
                "publication_date": pub_date,
                "article_type":     article_type,
                "language":         "en",
                "keywords":         keywords,
                "mesh_terms":       mesh_terms,
                "open_access":      False,
                "retracted":        False,
                "retraction_reason": None,
                "source":           "pubmed",
                "source_external_id": f"PMID:{pmid}",
                "source_url":       f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                "word_count":       word_count,
                "fetch_timestamp":  datetime.utcnow().isoformat(),
                "scraper_version":  SCRAPER_VERSION,
            })

        except Exception as e:
            print(f"  [PubMed] Parse error: {e}")

    return papers

async def run_pubmed(query: str, max_results: int = 10) -> list:
    print(f"\n[PubMed] Query: {query}")
    delay = 0.1 if NCBI_API_KEY else 0.35

    async with httpx.AsyncClient(timeout=30) as client:
        pmids = await _get_pmids(query, max_results, client)
        if not pmids:
            return []

        all_papers = []
        batch_size = 100
        total_batches = (len(pmids) + batch_size - 1) // batch_size

        for i in range(0, len(pmids), batch_size):
            batch = pmids[i: i + batch_size]
            batch_num = i // batch_size + 1
            print(f"  [PubMed] Fetching batch {batch_num}/{total_batches} ({len(batch)} papers)...")
            papers = await _fetch_pubmed_batch(batch, client)
            all_papers.extend(papers)
            await asyncio.sleep(delay)

    print(f"  [PubMed] Done. {len(all_papers)} papers fetched.")
    return all_papers

def search_and_scrape(query: str, max_results: int = 10, output_dir: str = "/home/harshita/Projects/Brahma/brahma/ai/ingestion/output") -> list:
    """Entry point — runs PMC scraper (has full text) via asyncio."""
    os.makedirs(output_dir, exist_ok=True)

    papers = asyncio.run(run_pmc(query, max_results))

    results = []
    for paper in papers:
        if not paper.get("title"):
            continue
        safe_id = paper["source_external_id"].replace(":","_").replace("/","_")
        out_path = f"{output_dir}/{safe_id}.json"
        if os.path.exists(out_path):
            print(f"  [SKIP] {safe_id} already saved")
            continue
        with open(out_path, "w") as f:
            json.dump(paper, f, indent=2, ensure_ascii=False)
        words = paper.get("word_count", 0)
        print(f"  [SAVED] {safe_id}.json | {paper['title'][:50]} | {words} words")
        results.append(paper)

    print(f"\n[DONE] Saved {len(results)} articles for: {query}")
    return results
