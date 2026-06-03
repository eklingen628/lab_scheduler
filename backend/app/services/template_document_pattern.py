from sqlalchemy.orm import Session
from app.models.template_document_pattern import TemplateDocumentPattern
from app.schemas.template_document_pattern import TemplateDocumentPatternCreate, TemplateDocumentPatternUpdate


def create_template_document_pattern(db: Session, data: TemplateDocumentPatternCreate) -> TemplateDocumentPattern:
    pattern = TemplateDocumentPattern(**data.model_dump())
    db.add(pattern)
    db.commit()
    db.refresh(pattern)
    return pattern


def get_template_document_patterns(db: Session) -> list[TemplateDocumentPattern]:
    return db.query(TemplateDocumentPattern).all()


def get_template_document_pattern(db: Session, pattern_id: int) -> TemplateDocumentPattern | None:
    return db.get(TemplateDocumentPattern, pattern_id)


def update_template_document_pattern(db: Session, pattern_id: int, data: TemplateDocumentPatternUpdate) -> TemplateDocumentPattern | None:
    pattern = db.get(TemplateDocumentPattern, pattern_id)
    if not pattern:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pattern, field, value)
    db.commit()
    db.refresh(pattern)
    return pattern


def delete_template_document_pattern(db: Session, pattern_id: int) -> bool:
    pattern = db.get(TemplateDocumentPattern, pattern_id)
    if not pattern:
        return False
    db.delete(pattern)
    db.commit()
    return True
