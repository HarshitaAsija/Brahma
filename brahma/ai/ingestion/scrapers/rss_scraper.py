import re
import json
import os
import requests
from datetime import datetime
from typing import Optional
from ai.ingestion.scrapers.base import SCRAPER_VERSION

RSS_FEEDS = {
    "biorxiv_neuroscience": "https://connect.biorxiv.org/biorxiv_xml.php?subject=neuroscience",
    "biorxiv_cancer"      : "https://connect.biorxiv.org/biorxiv_xml.php?subject=cancer_biology",
    "medrxiv_all"         : "https://connect.medrxiv.org/medrxiv_xml.php?subject=all",
}

def _clean(text):
    text = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", text, flags=re.DOTALL)
    return re.sub(r"<[^>]+>", "", text).strip()

def _get_tag(tag, xml):
    m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", xml, re.DOTALL)
    return _clean(m.group(1)) if m else None

def _parse_rss_item(item_xml, source):
    title = _get_tag("title", item_xml)
    if not title:
        return None

    link = _get_tag("link", item_xml) or _get_tag("guid", item_xml) or ""
    abstract = _get_tag("description", item_xml) or None
    pub_date = _get_tag("dc:date", item_xml) or _get_tag("pubDate", item_xml) or None
    authors_raw = _get_tag("dc:creator", item_xml) or ""
    authors = [a.strip() for a in re.split(r"[;,]", authors_raw) if a.strip()]

    doi = None
    doi_match = re.search(r"10\.\d{4,}/[^\s\"'<>&\]]+", item_xml)
    if doi_match:
        doi = doi_match.group(0).rstrip(".")

    pub_date_parsed = None
    if pub_date:
        for fmt in ["%Y-%m-%d", "%a, %d %b %Y %H:%M:%S %z", "%d %b %Y"]:
            try:
                pub_date_parsed = datetime.strptime(pub_date.strip()[:25], fmt).strftime("%Y-%m-%d")
                break
            except:
                continue

    return {
        "doi"              : doi,
        "pmid"             : None,
        "title"            : title,
        "abstract"         : abstract,
        "full_text"        : None,
        "sections"         : {},
        "authors"          : authors,
        "journal"          : None,
        "publication_date" : pub_date_parsed,
        "article_type"     : "RSS Entry",
        "language"         : "en",
        "keywords"         : [],
        "mesh_terms"       : [],
        "open_access"      : True,
        "retracted"        : False,
        "retraction_reason": None,
        "source"           : f"rss_{source}",
        "source_external_id": doi or link,
        "source_url"       : link,
        "fetch_timestamp"  : datetime.utcnow().isoformat(),
        "scraper_version"  : SCRAPER_VERSION,
    }

def poll_rss_feed(feed_name, feed_url,
                  output_dir="ai/ingestion/output/rss"):
    os.makedirs(output_dir, exist_ok=True)
    results = []

    print(f"[RSS] Polling {feed_name}...")
    try:
        r = requests.get(feed_url, timeout=15,
                         headers={"User-Agent": "BRAHMA/1.0 research bot"})
        xml = r.text
    except Exception as e:
        print(f"[ERROR] {e}")
        return []

    # RSS 1.0 uses <item rdf:about="..."> outside <channel>
    items = re.findall(r'<item[^>]*rdf:about[^>]*>(.*?)</item>', xml, re.DOTALL)
    if not items:
        items = re.findall(r"<item>(.*?)</item>", xml, re.DOTALL)
    if not items:
        items = re.findall(r"<entry>(.*?)</entry>", xml, re.DOTALL)

    print(f"[RSS] Found {len(items)} items")

    for item_xml in items[:20]:  # max 20 per feed
        article = _parse_rss_item(item_xml, feed_name)
        if article and article["title"]:
            fname = re.sub(r"[^a-z0-9]", "_", article["title"][:40].lower()) + ".json"
            fpath = os.path.join(output_dir, fname)
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(article, f, indent=2, ensure_ascii=False)
            results.append(article)
            print(f"[SAVED] {article['title'][:50]}")

    print(f"[RSS] Saved {len(results)} from {feed_name}")
    return results

def poll_all_feeds(output_dir="ai/ingestion/output/rss", feeds=None):
    """F6 - Poll all RSS feeds. Run every 6 hours for incremental updates."""
    if feeds is None:
        feeds = RSS_FEEDS
    all_results = []
    for name, url in feeds.items():
        all_results.extend(poll_rss_feed(name, url, output_dir))
    print(f"[DONE] Total {len(all_results)} articles from {len(feeds)} feeds")
    return all_results
