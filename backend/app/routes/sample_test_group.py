from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.sample_test_group import SampleTestGroupCreate, SampleTestGroupRead, SampleTestGroupUpdate
from app.services import sample_test_group as sample_test_group_service

router = APIRouter(prefix="/sample-test-groups", tags=["sample-test-groups"])


@router.post("", response_model=SampleTestGroupRead)
def create(data: SampleTestGroupCreate, db: Session = Depends(get_db)):
    return sample_test_group_service.create_sample_test_group(db, data)


@router.get("", response_model=list[SampleTestGroupRead])
def list_all(db: Session = Depends(get_db)):
    return sample_test_group_service.get_sample_test_groups(db)


@router.get("/{sample_test_group_id}", response_model=SampleTestGroupRead)
def get(sample_test_group_id: int, db: Session = Depends(get_db)):
    sample_test_group = sample_test_group_service.get_sample_test_group(db, sample_test_group_id)
    if not sample_test_group:
        raise HTTPException(404, "Sample test group not found")
    return sample_test_group


@router.patch("/{sample_test_group_id}", response_model=SampleTestGroupRead)
def update(sample_test_group_id: int, data: SampleTestGroupUpdate, db: Session = Depends(get_db)):
    sample_test_group = sample_test_group_service.update_sample_test_group(db, sample_test_group_id, data)
    if not sample_test_group:
        raise HTTPException(404, "Sample test group not found")
    return sample_test_group


@router.delete("/{sample_test_group_id}")
def delete(sample_test_group_id: int, db: Session = Depends(get_db)):
    if not sample_test_group_service.delete_sample_test_group(db, sample_test_group_id):
        raise HTTPException(404, "Sample test group not found")
    return {"deleted": True}
