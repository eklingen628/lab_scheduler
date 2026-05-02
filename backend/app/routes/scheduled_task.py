from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.scheduled_task import ScheduledTaskCreate, ScheduledTaskRead, ScheduledTaskUpdate
from app.services import scheduled_task as scheduled_task_service

router = APIRouter(prefix="/scheduled-tasks", tags=["scheduled-tasks"])


@router.post("", response_model=ScheduledTaskRead)
def create(data: ScheduledTaskCreate, db: Session = Depends(get_db)):
    return scheduled_task_service.create_scheduled_task(db, data)


@router.get("", response_model=list[ScheduledTaskRead])
def list_all(db: Session = Depends(get_db)):
    return scheduled_task_service.get_scheduled_tasks(db)


@router.get("/{scheduled_task_id}", response_model=ScheduledTaskRead)
def get(scheduled_task_id: int, db: Session = Depends(get_db)):
    scheduled_task = scheduled_task_service.get_scheduled_task(db, scheduled_task_id)
    if not scheduled_task:
        raise HTTPException(404, "Scheduled task not found")
    return scheduled_task


@router.patch("/{scheduled_task_id}", response_model=ScheduledTaskRead)
def update(scheduled_task_id: int, data: ScheduledTaskUpdate, db: Session = Depends(get_db)):
    scheduled_task = scheduled_task_service.update_scheduled_task(db, scheduled_task_id, data)
    if not scheduled_task:
        raise HTTPException(404, "Scheduled task not found")
    return scheduled_task


@router.delete("/{scheduled_task_id}")
def delete(scheduled_task_id: int, db: Session = Depends(get_db)):
    if not scheduled_task_service.delete_scheduled_task(db, scheduled_task_id):
        raise HTTPException(404, "Scheduled task not found")
    return {"deleted": True}
