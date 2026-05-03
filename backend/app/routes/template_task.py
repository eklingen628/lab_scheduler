from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.template_task import TemplateTaskCreate, TemplateTaskRead, TemplateTaskUpdate
from app.services import template_task as template_task_service

router = APIRouter(prefix="/template-tasks", tags=["template-tasks"])


@router.post("", response_model=TemplateTaskRead)
def create(data: TemplateTaskCreate, db: Session = Depends(get_db)):
    return template_task_service.create(db, data)


@router.get("", response_model=list[TemplateTaskRead])
def list_all(db: Session = Depends(get_db)):
    return template_task_service.get_template_tasks(db)


@router.get("/{template_task_id}", response_model=TemplateTaskRead)
def get(template_task_id: int, db: Session = Depends(get_db)):
    template_task = template_task_service.get_template_task(db, template_task_id)
    if not template_task:
        raise HTTPException(404, "Template task not found")
    return template_task


@router.patch("/{template_task_id}", response_model=TemplateTaskRead)
def update(template_task_id: int, data: TemplateTaskUpdate, db: Session = Depends(get_db)):
    template_task = template_task_service.update_template_task(db, template_task_id, data)
    if not template_task:
        raise HTTPException(404, "Template task not found")
    return template_task


@router.delete("/{template_task_id}")
def delete(template_task_id: int, db: Session = Depends(get_db)):
    if not template_task_service.delete_template_task(db, template_task_id):
        raise HTTPException(404, "Template task not found")
    return {"deleted": True}
