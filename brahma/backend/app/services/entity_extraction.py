import re
from sqlalchemy.orm import Session

from app.models.paper import Paper
from app.models.entity import Entity
from app.models.paper_entity import PaperEntity


ENTITY_PATTERNS = {
    "Gene": [
        "BRCA1", "BRCA2", "TP53", "EGFR", "TNF", "IL6", "APOE",
        "PLX5622", "CSF1R"
    ],
    "Protein": [
        "PCSK9", "BCMA", "p-tau217", "amyloid", "tau", "LDL-C"
    ],
    "Drug": [
        "Evolocumab", "Semaglutide", "Tirzepatide", "PLX5622",
        "Metformin", "Aspirin"
    ],
    "Disease": [
        "Breast Cancer", "Alzheimer", "Cardiovascular Disease",
        "Multiple Myeloma", "Obesity", "Metabolic Syndrome",
        "heart attack", "alcohol-induced neurodegeneration"
    ],
}


def _find_sentence(text: str, entity: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    for sentence in sentences:
        if entity.lower() in sentence.lower():
            return sentence[:1000]
    return text[:500]


def _extract_entities(text: str) -> list[dict]:
    found = []

    for entity_type, names in ENTITY_PATTERNS.items():
        for name in names:
            pattern = r"\b" + re.escape(name) + r"\b"
            if re.search(pattern, text, flags=re.IGNORECASE):
                found.append({
                    "canonical_name": name,
                    "entity_type": entity_type,
                    "evidence_text": _find_sentence(text, name),
                    "section": "title_abstract_full_text",
                })

    return found


def extract_entities_for_paper(db: Session, paper_id: int) -> list[dict]:
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise ValueError("Paper not found")

    text = " ".join([
        paper.title or "",
        paper.abstract or "",
        paper.full_text or "",
    ])

    extracted = _extract_entities(text)
    results = []

    for item in extracted:
        entity = (
            db.query(Entity)
            .filter(
                Entity.canonical_name == item["canonical_name"],
                Entity.entity_type == item["entity_type"],
            )
            .first()
        )

        if not entity:
            entity = Entity(
                canonical_name=item["canonical_name"],
                entity_type=item["entity_type"],
                description=None,
            )
            db.add(entity)
            db.flush()

        existing_link = (
            db.query(PaperEntity)
            .filter(
                PaperEntity.paper_id == paper.id,
                PaperEntity.entity_id == entity.id,
                PaperEntity.section == item["section"],
            )
            .first()
        )

        if not existing_link:
            link = PaperEntity(
                paper_id=paper.id,
                entity_id=entity.id,
                section=item["section"],
                evidence_text=item["evidence_text"],
            )
            db.add(link)

        results.append({
            "entity_id": entity.id,
            "canonical_name": entity.canonical_name,
            "entity_type": entity.entity_type,
            "section": item["section"],
            "evidence_text": item["evidence_text"],
        })

    db.commit()
    return results


def get_entities_for_paper(db: Session, paper_id: int) -> list[dict]:
    rows = (
        db.query(PaperEntity, Entity)
        .join(Entity, PaperEntity.entity_id == Entity.id)
        .filter(PaperEntity.paper_id == paper_id)
        .all()
    )

    return [
        {
            "entity_id": entity.id,
            "canonical_name": entity.canonical_name,
            "entity_type": entity.entity_type,
            "section": paper_entity.section,
            "evidence_text": paper_entity.evidence_text,
        }
        for paper_entity, entity in rows
    ]
