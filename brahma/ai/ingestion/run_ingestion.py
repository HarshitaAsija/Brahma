"""
BRAHMA Literature Ingestion
Usage:
    python -m ai.ingestion.run_ingestion --query "cancer immunotherapy" --max 10
    python -m ai.ingestion.run_ingestion --query "type 2 diabetes GLP-1" --max 5
"""
import argparse
import json
import os
from ai.ingestion.scrapers.search_scraper import search_and_scrape

OUTPUT_DIR = "ai/ingestion/output"

DEFAULT_QUERIES = [
    "cancer immunotherapy checkpoint inhibitor",
    "type 2 diabetes GLP-1 receptor agonist",
    "Alzheimer disease amyloid beta treatment",
]

def run(query: str, max_results: int = 10):
    print(f"\n{'='*60}")
    print(f"BRAHMA Ingestion: {query}")
    print(f"{'='*60}")
    results = search_and_scrape(query, max_results=max_results, output_dir=OUTPUT_DIR)
    print(f"\nIngested {len(results)} articles")
    for r in results:
        words = len(r['full_text'].split()) if r['full_text'] else 0
        print(f"  [{r['pmc_id']}] {r['title'][:70]} ({words} words)")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BRAHMA literature ingestion")
    parser.add_argument("--query", type=str, default="cancer immunotherapy", help="Search query")
    parser.add_argument("--max", type=int, default=10, help="Max articles to scrape")
    args = parser.parse_args()
    run(args.query, args.max)
