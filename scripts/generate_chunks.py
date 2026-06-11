# scripts/generate_chunks.py
"""Generate token‑aware chunks for the sample paper and write them to a JSON file.

The script uses the ``SimpleWhitespaceTokenizer`` (no external dependencies) and
writes a list of chunk dictionaries to ``output_chunks.json`` in the repository
root.  It avoids the persistence layer so it works in any environment without a
database.
"""

import json
import pathlib
import sys

# Ensure the project source is on the import path
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from brahma.adapters.ingestion_adapter import parse_paper_json
from brahma.infrastructure.tokenizers.simple_tokenizer import SimpleWhitespaceTokenizer
from brahma.application.services.chunker import Chunker


def _load_sections(data: dict) -> list[dict]:
    """Return a list of ``{"heading": str, "content": str}`` sections.

    The sample JSON stores ``sections`` as a mapping ``{heading: content}``.  If
    the payload already provides a list we return it unchanged.
    """
    raw = data.get("sections", [])
    if isinstance(raw, dict):
        return [{"heading": k, "content": v} for k, v in raw.items()]
    # Assume it is already a list of dicts
    return raw


def main() -> None:
    sample_path = pathlib.Path("src/brahma/sample paper.json")
    if not sample_path.is_file():
        print("Sample paper JSON not found", file=sys.stderr)
        sys.exit(1)

    # Load raw JSON first to handle the dict‑style sections
    raw_json = sample_path.read_text()
    raw_data = json.loads(raw_json)
    # Convert sections to the expected list format before feeding the adapter
    raw_data["sections"] = _load_sections(raw_data)
    paper = parse_paper_json(json.dumps(raw_data))

    tokenizer = SimpleWhitespaceTokenizer()
    chunker = Chunker(tokenizer)
    chunks = []
    for sec in paper.sections:
        chunks.extend(chunker.chunk_section(paper.paper_id, sec))

    # Serialize chunks – convert UUIDs to strings for JSON friendliness
    serialised = [
        {
            "chunk_id": str(c.chunk_id),
            "paper_id": str(c.paper_id),
            "section_name": c.section_name,
            "chunk_text": c.chunk_text,
        }
        for c in chunks
    ]

    out_path = pathlib.Path("output_chunks.json")
    out_path.write_text(json.dumps(serialised, indent=2, ensure_ascii=False))
    print(f"Wrote {len(serialised)} chunks to {out_path}")


if __name__ == "__main__":
    main()
