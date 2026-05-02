from sqlalchemy.orm import Session
from app.models.person import Person
from app.schemas.person import PersonCreate, PersonUpdate


def create_person(db: Session, data: PersonCreate) -> Person:
    person = Person(**data.model_dump())
    db.add(person)
    db.commit()
    db.refresh(person)
    return person


def get_people(db: Session) -> list[Person]:
    return db.query(Person).all()


def get_person(db: Session, person_id: int) -> Person | None:
    return db.get(Person, person_id)


def update_person(db: Session, person_id: int, data: PersonUpdate) -> Person | None:
    person = db.get(Person, person_id)
    if not person:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(person, field, value)
    db.commit()
    db.refresh(person)
    return person


def delete_person(db: Session, person_id: int) -> bool:
    person = db.get(Person, person_id)
    if not person:
        return False
    db.delete(person)
    db.commit()
    return True