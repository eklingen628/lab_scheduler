from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.person import PersonCreate, PersonRead, PersonUpdate
from app.services import person as person_service

router = APIRouter(prefix="/people", tags=["people"])


@router.post("", response_model=PersonRead)
def create(data: PersonCreate, db: Session = Depends(get_db)):
    return person_service.create_person(db, data)


@router.get("", response_model=list[PersonRead])
def list_all(db: Session = Depends(get_db)):
    return person_service.get_people(db)


@router.get("/{person_id}", response_model=PersonRead)
def get(person_id: int, db: Session = Depends(get_db)):
    person = person_service.get_person(db, person_id)
    if not person:
        raise HTTPException(404, "Person not found")
    return person


@router.patch("/{person_id}", response_model=PersonRead)
def update(person_id: int, data: PersonUpdate, db: Session = Depends(get_db)):
    person = person_service.update_person(db, person_id, data)
    if not person:
        raise HTTPException(404, "Person not found")
    return person


@router.delete("/{person_id}")
def delete(person_id: int, db: Session = Depends(get_db)):
    if not person_service.delete_person(db, person_id):
        raise HTTPException(404, "Person not found")
    return {"deleted": True}