from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.sample_test import SampleTestCreate, SampleTestRead, SampleTestUpdate
from app.services import sample_test as sample_test_service

router = APIRouter(prefix="/sample-tests", tags=["sample-tests"])


@router.post("", response_model=SampleTestRead)
def create(data: SampleTestCreate, db: Session = Depends(get_db)):
    return sample_test_service.create_sample_test(db, data)


@router.get("", response_model=list[SampleTestRead])
def list_all(db: Session = Depends(get_db)):
    return sample_test_service.get_sample_tests(db)


@router.get("/{sample_test_id}", response_model=SampleTestRead)
def get(sample_test_id: int, db: Session = Depends(get_db)):
    sample_test = sample_test_service.get_sample_test(db, sample_test_id)
    if not sample_test:
        raise HTTPException(404, "Sample test not found")
    return sample_test


@router.patch("/{sample_test_id}", response_model=SampleTestRead)
def update(sample_test_id: int, data: SampleTestUpdate, db: Session = Depends(get_db)):
    sample_test = sample_test_service.update_sample_test(db, sample_test_id, data)
    if not sample_test:
        raise HTTPException(404, "Sample test not found")
    return sample_test


@router.delete("/{sample_test_id}")
def delete(sample_test_id: int, db: Session = Depends(get_db)):
    if not sample_test_service.delete_sample_test(db, sample_test_id):
        raise HTTPException(404, "Sample test not found")
    return {"deleted": True}
