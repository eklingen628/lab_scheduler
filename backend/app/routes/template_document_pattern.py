from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.template_document_pattern import TemplateDocumentPatternCreate, TemplateDocumentPatternRead, TemplateDocumentPatternUpdate
from app.services import template_document_pattern as template_document_pattern_service

router = APIRouter(prefix="/template-document-patterns", tags=["template-document-patterns"])


@router.post("", response_model=TemplateDocumentPatternRead)
def create(data: TemplateDocumentPatternCreate, db: Session = Depends(get_db)):
    return template_document_pattern_service.create_template_document_pattern(db, data)


@router.get("", response_model=list[TemplateDocumentPatternRead])
def list_all(db: Session = Depends(get_db)):
    return template_document_pattern_service.get_template_document_patterns(db)


@router.get("/{pattern_id}", response_model=TemplateDocumentPatternRead)
def get(pattern_id: int, db: Session = Depends(get_db)):
    pattern = template_document_pattern_service.get_template_document_pattern(db, pattern_id)
    if not pattern:
        raise HTTPException(404, "Template document pattern not found")
    return pattern


@router.patch("/{pattern_id}", response_model=TemplateDocumentPatternRead)
def update(pattern_id: int, data: TemplateDocumentPatternUpdate, db: Session = Depends(get_db)):
    pattern = template_document_pattern_service.update_template_document_pattern(db, pattern_id, data)
    if not pattern:
        raise HTTPException(404, "Template document pattern not found")
    return pattern


@router.delete("/{pattern_id}")
def delete(pattern_id: int, db: Session = Depends(get_db)):
    if not template_document_pattern_service.delete_template_document_pattern(db, pattern_id):
        raise HTTPException(404, "Template document pattern not found")
    return {"deleted": True}
