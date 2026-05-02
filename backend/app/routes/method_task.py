from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.method_task import MethodTaskCreate, MethodTaskRead, MethodTaskUpdate
from app.services import method_task as method_task_service

router = APIRouter(prefix="/method-tasks", tags=["method-tasks"])


@router.post("", response_model=MethodTaskRead)
def create(data: MethodTaskCreate, db: Session = Depends(get_db)):
    return method_task_service.create(db, data)


@router.get("", response_model=list[MethodTaskRead])
def list_all(db: Session = Depends(get_db)):
    return method_task_service.get_method_tasks(db)


@router.get("/{method_task_id}", response_model=MethodTaskRead)
def get(method_task_id: int, db: Session = Depends(get_db)):
    method_task = method_task_service.get_method_task(db, method_task_id)
    if not method_task:
        raise HTTPException(404, "Method task not found")
    return method_task


@router.patch("/{method_task_id}", response_model=MethodTaskRead)
def update(method_task_id: int, data: MethodTaskUpdate, db: Session = Depends(get_db)):
    method_task = method_task_service.update_method_task(db, method_task_id, data)
    if not method_task:
        raise HTTPException(404, "Method task not found")
    return method_task


@router.delete("/{method_task_id}")
def delete(method_task_id: int, db: Session = Depends(get_db)):
    if not method_task_service.delete_method_task(db, method_task_id):
        raise HTTPException(404, "Method task not found")
    return {"deleted": True}
