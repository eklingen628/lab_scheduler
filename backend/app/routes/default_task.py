from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.default_task import DefaultTaskCreate, DefaultTaskRead, DefaultTaskUpdate
from app.services import default_task as default_task_service

router = APIRouter(prefix="/default-tasks", tags=["default-tasks"])


@router.post("", response_model=DefaultTaskRead)
def create(data: DefaultTaskCreate, db: Session = Depends(get_db)):
    return default_task_service.create_default_task(db, data)


@router.get("", response_model=list[DefaultTaskRead])
def list_all(db: Session = Depends(get_db)):
    return default_task_service.get_default_tasks(db)


@router.get("/{default_task_id}", response_model=DefaultTaskRead)
def get(default_task_id: int, db: Session = Depends(get_db)):
    default_task = default_task_service.get_default_task(db, default_task_id)
    if not default_task:
        raise HTTPException(404, "Default task not found")
    return default_task


@router.patch("/{default_task_id}", response_model=DefaultTaskRead)
def update(default_task_id: int, data: DefaultTaskUpdate, db: Session = Depends(get_db)):
    default_task = default_task_service.update_default_task(db, default_task_id, data)
    if not default_task:
        raise HTTPException(404, "Default task not found")
    return default_task


@router.delete("/{default_task_id}")
def delete(default_task_id: int, db: Session = Depends(get_db)):
    if not default_task_service.delete_default_task(db, default_task_id):
        raise HTTPException(404, "Default task not found")
    return {"deleted": True}
