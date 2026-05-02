from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.method_alias import MethodAliasCreate, MethodAliasRead, MethodAliasUpdate
from app.services import method_alias as method_alias_service

router = APIRouter(prefix="/method-aliases", tags=["method-aliases"])


@router.post("", response_model=MethodAliasRead)
def create(data: MethodAliasCreate, db: Session = Depends(get_db)):
    return method_alias_service.create_method_alias(db, data)


@router.get("", response_model=list[MethodAliasRead])
def list_all(db: Session = Depends(get_db)):
    return method_alias_service.get_method_aliases(db)


@router.get("/{method_alias_id}", response_model=MethodAliasRead)
def get(method_alias_id: int, db: Session = Depends(get_db)):
    method_alias = method_alias_service.get_method_alias(db, method_alias_id)
    if not method_alias:
        raise HTTPException(404, "Method alias not found")
    return method_alias


@router.patch("/{method_alias_id}", response_model=MethodAliasRead)
def update(method_alias_id: int, data: MethodAliasUpdate, db: Session = Depends(get_db)):
    method_alias = method_alias_service.update_method_alias(db, method_alias_id, data)
    if not method_alias:
        raise HTTPException(404, "Method alias not found")
    return method_alias


@router.delete("/{method_alias_id}")
def delete(method_alias_id: int, db: Session = Depends(get_db)):
    if not method_alias_service.delete_method_alias(db, method_alias_id):
        raise HTTPException(404, "Method alias not found")
    return {"deleted": True}
