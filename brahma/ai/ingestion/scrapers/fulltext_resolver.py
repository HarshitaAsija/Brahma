"""
fulltext_resolver.py — API-only full-text retrieval from DOI.

Priority chain (no browser / no Playwright needed):
  1. NCBI PMC E-utilities  — via DOI lookup -> efetch XML (async, same as pmc_scraper)
  2. Europe PMC REST API   — broader coverage, also free
  3. None                  — caller falls back to abstract
"""

import re
import httpx
import asyncio
import xml.etree.ElementTree as ET
from typing import Optional

NCBI_API_KEY = None
_TIMEOUT = 20
BASE_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
BASE_FETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


def _itertext(el) -> str:
    return "".join(el.itertext()).strip() if el is not None else ""


async def _doi_to_pmcid(doi: str, client: httpx.AsyncClient) -> Optional[str]:
    params = {
        "db": "pmc",
        "term": f"{doi}[doi]",
        "retmax": 1,
        "retmode": "json",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    try:
        r = await client.get(BASE_SEARCH, params=params)
        r.raise_for_status()
        ids = r.json()["esearchresult"]["idlist"]
        return ids[0] if ids else None
    except Exception as e:
        print(f"      [FULLTEXT] PMC search error: {e}")
        return None


async def _fetch_pmc_fulltext(pmcid: str, client: httpx.AsyncClient) -> Optional[dict]:
    params = {"db": "pmc", "id": pmcid, "retmode": "xml"}
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    try:
        r = await client.get(BASE_FETCH, params=params)
        r.raise_for_status()
    except Exception as e:
        print(f"      [FULLTEXT] PMC fetch error: {e}")
        return None

    try:
        root = ET.fromstring(r.text)
    except ET.ParseError as e:
        print(f"      [FULLTEXT] XML parse error: {e}")
        return None

    article = root.find(".//article")
    if article is None:
        return None

    body_els = article.findall(".//body//p")
    body = " ".join(_itertext(el) for el in body_els).strip()

    sections = {}
    for sec in article.findall(".//body//sec"):
        heading_el = sec.find("title")
        heading = _itertext(heading_el) if heading_el is not None else ""
        paras = sec.findall("p")
        content = " ".join(_itertext(p) for p in paras).strip()
        if heading and content:
            sections[heading] = content

    if not body:
        return None

    return {"full_text": body, "sections": sections, "source": "pmc", "open_access": True}


async def _europepmc_fulltext(doi: str, client: httpx.AsyncClient) -> Optional[dict]:
    try:
        r = await client.get(
            "https://www.ebi.ac.uk/europepmc/webservices/rest/search",
            params={"query": f"DOI:{doi}", "format": "json", "resultType": "core", "pageSize": 1},
        )
        r.raise_for_status()
        results = r.json().get("resultList", {}).get("result", [])
        if not results:
            return None
        pmcid = results[0].get("pmcid", "")
        if not pmcid:
            return None
    except Exception as e:
        print(f"      [FULLTEXT] EuropePMC search error: {e}")
        return None

    try:
        r = await client.get(
            f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML"
        )
        r.raise_for_status()
    except Exception as e:
        print(f"      [FULLTEXT] EuropePMC fulltext error: {e}")
        return None

    try:
        root = ET.fromstring(r.text)
    except ET.ParseError:
        return None

    body_els = root.findall(".//body//p")
    body = " ".join(_itertext(el) for el in body_els).strip()

    sections = {}
    for sec in root.findall(".//body//sec"):
        heading_el = sec.find("title")
        heading = _itertext(heading_el) if heading_el is not None else ""
        paras = sec.findall("p")
        content = " ".join(_itertext(p) for p in paras).strip()
        if heading and content:
            sections[heading] = content

    if not body:
        return None

    return {"full_text": body, "sections": sections, "source": "europepmc", "open_access": True}


async def _resolve_async(doi: str) -> Optional[dict]:
    async with httpx.AsyncClient(
        timeout=_TIMEOUT,
        follow_redirects=True,
        headers={"User-Agent": "BrahmaBot/1.0 (research)"},
    ) as client:
        print(f"      [FULLTEXT] Trying PMC for DOI: {doi}")
        pmcid = await _doi_to_pmcid(doi, client)
        if pmcid:
            print(f"      [FULLTEXT] Found PMCID: {pmcid}")
            result = await _fetch_pmc_fulltext(pmcid, client)
            if result:
                return result

        print(f"      [FULLTEXT] Trying Europe PMC for DOI: {doi}")
        result = await _europepmc_fulltext(doi, client)
        if result:
            return result

    print(f"      [FULLTEXT] No open-access full text found for DOI: {doi}")
    return None


def resolve_fulltext_from_doi(doi: str) -> Optional[dict]:
    """Sync wrapper — called from pubmed_scraper inside asyncio.run()."""
    if not doi:
        return None
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # We're inside an existing event loop (pubmed_scraper's asyncio.run)
            # use asyncio.ensure_future via a new thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, _resolve_async(doi))
                return future.result()
        else:
            return loop.run_until_complete(_resolve_async(doi))
    except Exception as e:
        print(f"      [FULLTEXT] Resolver error: {e}")
        return None
