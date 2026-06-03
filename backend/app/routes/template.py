from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.template import TemplateCreate, TemplateRead, TemplateUpdate
from app.services import template as template_service

router = APIRouter(prefix="/templates", tags=["templates"])


@router.post("", response_model=TemplateRead)
def create(data: TemplateCreate, db: Session = Depends(get_db)):
    return template_service.create_template(db, data)



@router.post("/{template_id}/copy", response_model=TemplateRead)
def copy_template(template_id: int, db: Session = Depends(get_db)):
    template = template_service.copy_template(db, template_id)
    if not template:
        raise HTTPException(404, "Template not found")
    return template


@router.get("", response_model=list[TemplateRead])
def list_all(db: Session = Depends(get_db)):
    return template_service.get_templates(db)


@router.get("/{template_id}", response_model=TemplateRead)
def get(template_id: int, db: Session = Depends(get_db)):
    template = template_service.get_template(db, template_id)
    if not template:
        raise HTTPException(404, "Template not found")
    return template


@router.patch("/{template_id}", response_model=TemplateRead)
def update(template_id: int, data: TemplateUpdate, db: Session = Depends(get_db)):
    template = template_service.update_template(db, template_id, data)
    if not template:
        raise HTTPException(404, "Template not found")
    return template


@router.delete("/{template_id}")
def delete(template_id: int, db: Session = Depends(get_db)):
    if not template_service.delete_template(db, template_id):
        raise HTTPException(404, "Template not found")
    return {"deleted": True}
