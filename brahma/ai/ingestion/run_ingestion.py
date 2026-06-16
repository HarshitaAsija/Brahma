"""
BRAHMA Literature Ingestion
Usage:
    python -m ai.ingestion.run_ingestion --query "cancer immunotherapy" --max 10
    python -m ai.ingestion.run_ingestion --query "type 2 diabetes" --max 5
    python -m ai.ingestion.run_ingestion --query "Alzheimer amyloid" --source biorxiv --max 3
"""
import argparse
import json
import os
import asyncio
from ai.ingestion.scrapers.search_scraper import search_and_scrape, run_pubmed
from ai.ingestion.scrapers.pmc_scraper import run_pmc
from ai.ingestion.scrapers.biorxiv_scraper import search_and_scrape as biorxiv_scrape

OUTPUT_DIR = "/home/vinni_kapoor/Brahma/brahma/ai/ingestion/output"

def run(query: str, max_results: int = 10, source: str = "pmc"):
    print(f"\n{'='*60}")
    print(f"BRAHMA Ingestion")
    print(f"  Query  : {query}")
    print(f"  Max    : {max_results}")
    print(f"  Source : {source}")
    print(f"{'='*60}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    results = []

    if source == "pmc":
        results = search_and_scrape(query, max_results, OUTPUT_DIR)

    elif source == "pubmed":
        papers = asyncio.run(run_pubmed(query, max_results))
        for paper in papers:
            if not paper.get("title"):
                continue
            safe_id = paper["source_external_id"].replace(":", "_").replace("/", "_")
            out_path = f"{OUTPUT_DIR}/{safe_id}.json"
            with open(out_path, "w") as f:
                json.dump(paper, f, indent=2, ensure_ascii=False)
            results.append(paper)

    elif source in ("biorxiv", "medrxiv"):
        results = biorxiv_scrape(query, max_results, server=source, output_dir=OUTPUT_DIR)

    elif source == "all":
        results = search_and_scrape(query, max_results, OUTPUT_DIR)
        bio = biorxiv_scrape(query, max(2, max_results//3), server="biorxiv", output_dir=OUTPUT_DIR)
        med = biorxiv_scrape(query, max(2, max_results//3), server="medrxiv", output_dir=OUTPUT_DIR)
        results = results + bio + med

    print(f"\n{'='*60}")
    print(f"Ingested {len(results)} articles")
    for r in results:
        words = r.get("word_count", 0) or len(r.get("full_text", "").split()) if r.get("full_text") else 0
        sid = r.get("source_external_id", "")
        title = r.get("title", "")[:60]
        print(f"  [{sid}] {title} ({words} words)")
    print(f"{'='*60}")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BRAHMA literature ingestion")
    parser.add_argument("--query", type=str, default="cancer immunotherapy")
    parser.add_argument("--max", type=int, default=10)
    parser.add_argument("--source", type=str, default="pmc",
                        choices=["pmc", "pubmed", "biorxiv", "medrxiv", "all"])
    args = parser.parse_args()
    run(args.query, args.max, args.source)
