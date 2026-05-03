from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.template_test_name_alias import TemplateTestNameAliasCreate, TemplateTestNameAliasRead, TemplateTestNameAliasUpdate
from app.services import template_test_name_alias as template_test_name_alias_service

router = APIRouter(prefix="/template-test-name-aliases", tags=["template-test-name-aliases"])


@router.post("", response_model=TemplateTestNameAliasRead)
def create(data: TemplateTestNameAliasCreate, db: Session = Depends(get_db)):
    return template_test_name_alias_service.create_template_test_name_alias(db, data)


@router.get("", response_model=list[TemplateTestNameAliasRead])
def list_all(db: Session = Depends(get_db)):
    return template_test_name_alias_service.get_template_test_name_aliases(db)


@router.get("/{alias_id}", response_model=TemplateTestNameAliasRead)
def get(alias_id: int, db: Session = Depends(get_db)):
    alias = template_test_name_alias_service.get_template_test_name_alias(db, alias_id)
    if not alias:
        raise HTTPException(404, "Template test name alias not found")
    return alias


@router.patch("/{alias_id}", response_model=TemplateTestNameAliasRead)
def update(alias_id: int, data: TemplateTestNameAliasUpdate, db: Session = Depends(get_db)):
    alias = template_test_name_alias_service.update_template_test_name_alias(db, alias_id, data)
    if not alias:
        raise HTTPException(404, "Template test name alias not found")
    return alias


@router.delete("/{alias_id}")
def delete(alias_id: int, db: Session = Depends(get_db)):
    if not template_test_name_alias_service.delete_template_test_name_alias(db, alias_id):
        raise HTTPException(404, "Template test name alias not found")
    return {"deleted": True}
