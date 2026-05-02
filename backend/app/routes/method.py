from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.method import MethodCreate, MethodRead, MethodUpdate
from app.services import method as method_service

router = APIRouter(prefix="/methods", tags=["methods"])


@router.post("", response_model=MethodRead)
def create(data: MethodCreate, db: Session = Depends(get_db)):
    return method_service.create_method(db, data)


@router.get("", response_model=list[MethodRead])
def list_all(db: Session = Depends(get_db)):
    return method_service.get_methods(db)


@router.get("/{method_id}", response_model=MethodRead)
def get(method_id: int, db: Session = Depends(get_db)):
    method = method_service.get_method(db, method_id)
    if not method:
        raise HTTPException(404, "Method not found")
    return method


@router.patch("/{method_id}", response_model=MethodRead)
def update(method_id: int, data: MethodUpdate, db: Session = Depends(get_db)):
    method = method_service.update_method(db, method_id, data)
    if not method:
        raise HTTPException(404, "Method not found")
    return method


@router.delete("/{method_id}")
def delete(method_id: int, db: Session = Depends(get_db)):
    if not method_service.delete_person(db, method_id):
        raise HTTPException(404, "Method not found")
    return {"deleted": True}
