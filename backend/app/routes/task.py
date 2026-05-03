from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import task as task_service
from app.exceptions import DateRangeError
from datetime import date

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskRead)
def create(data: TaskCreate, db: Session = Depends(get_db)):
    return task_service.create_task(db, data)


@router.get("", response_model=list[TaskRead])
def list_all(start: date | None = None, end: date | None = None, db: Session = Depends(get_db)):
    if start is not None and end is not None:
        try:
            return task_service.get_tasks_date_range(db, start, end)
        except DateRangeError as e:
            raise HTTPException(400, str(e))
    return task_service.get_tasks(db)


@router.get("/{task_id}", response_model=TaskRead)
def get(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = task_service.update_task(db, task_id, data)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.delete("/{task_id}")
def delete(task_id: int, db: Session = Depends(get_db)):
    if not task_service.delete_task(db, task_id):
        raise HTTPException(404, "Task not found")
    return {"deleted": True}
