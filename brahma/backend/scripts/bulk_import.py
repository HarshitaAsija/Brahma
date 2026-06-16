"""
bulk_import.py
--------------
Reads all JSON files from a folder and imports them into the database
via the import service.

Usage:
    python scripts/bulk_import.py --folder /path/to/json/folder
    python scripts/bulk_import.py --folder /path/to/json/folder --verbose
"""

import argparse
import json
import os
import sys
from datetime import datetime

# Make sure app/ is on the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.schemas.paper import PaperImportRequest
from app.services.paper_import import import_paper


def load_json_file(filepath: str) -> dict | None:
    """Read a JSON file and return its contents as a dict."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"  ✗ Invalid JSON in {filepath}: {e}")
        return None
    except Exception as e:
        print(f"  ✗ Could not read {filepath}: {e}")
        return None


def import_single_file(filepath: str, verbose: bool = False) -> dict:
    """
    Import one JSON file into the database.
    Returns a result dict with status info.
    """
    filename = os.path.basename(filepath)

    # Load the JSON
    data = load_json_file(filepath)
    if data is None:
        return {"file": filename, "status": "error", "reason": "invalid JSON"}

    # Validate with Pydantic schema
    try:
        paper_data = PaperImportRequest(**data)
    except Exception as e:
        return {"file": filename, "status": "error", "reason": f"schema error: {e}"}

    # Import into database
    db = SessionLocal()
    try:
        result = import_paper(db=db, data=paper_data)

        if result.duplicate:
            return {
                "file": filename,
                "status": "duplicate",
                "paper_id": result.paper_id,
                "reason": "already in database",
            }
        else:
            return {
                "file": filename,
                "status": "imported",
                "paper_id": result.paper_id,
                "raw_paper_id": result.raw_paper_id,
            }

    except Exception as e:
        db.rollback()
        return {"file": filename, "status": "error", "reason": str(e)}
    finally:
        db.close()


def bulk_import(folder: str, verbose: bool = False):
    """
    Find all JSON files in a folder and import them one by one.
    Prints a summary at the end.
    """
    # Find all JSON files
    json_files = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.endswith(".json")
    ]

    if not json_files:
        print(f"No JSON files found in: {folder}")
        return

    total = len(json_files)
    print(f"\nFound {total} JSON file(s) in {folder}")
    print("=" * 60)

    # Track results
    imported = []
    duplicates = []
    errors = []

    start_time = datetime.now()

    for i, filepath in enumerate(json_files, 1):
        filename = os.path.basename(filepath)
        print(f"[{i}/{total}] {filename}", end=" ... ")

        result = import_single_file(filepath, verbose)

        if result["status"] == "imported":
            print(f"✅ imported (paper_id={result['paper_id']})")
            imported.append(result)

        elif result["status"] == "duplicate":
            print(f"⏭  duplicate (paper_id={result['paper_id']})")
            duplicates.append(result)

        else:
            print(f"❌ error: {result['reason']}")
            errors.append(result)

        if verbose:
            print(f"     → {result}")

    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    print("\n" + "=" * 60)
    print(f"DONE in {elapsed:.1f}s")
    print(f"  ✅ Imported  : {len(imported)}")
    print(f"  ⏭  Duplicates: {len(duplicates)}")
    print(f"  ❌ Errors    : {len(errors)}")
    print("=" * 60)

    if errors:
        print("\nFailed files:")
        for e in errors:
            print(f"  - {e['file']}: {e['reason']}")


def main():
    parser = argparse.ArgumentParser(
        description="Bulk import JSON papers into Brahma database"
    )
    parser.add_argument(
        "--folder",
        required=True,
        help="Path to folder containing JSON paper files",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed output for each file",
    )
    args = parser.parse_args()

    if not os.path.isdir(args.folder):
        print(f"Error: folder not found: {args.folder}")
        sys.exit(1)

    bulk_import(folder=args.folder, verbose=args.verbose)


if __name__ == "__main__":
    main()
