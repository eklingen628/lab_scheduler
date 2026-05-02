from sqlalchemy.orm import Session
from app.models.method import Method
from app.schemas.method import MethodCreate, MethodUpdate


def create_method(db: Session, data: MethodCreate) -> Method:
    method = Method(**data.model_dump())
    db.add(method)
    db.commit()
    db.refresh(method)
    return method


def get_methods(db: Session) -> list[Method]:
    return db.query(Method).all()


def get_method(db: Session, method_id: int) -> Method | None:
    return db.get(Method, method_id)


def update_method(db: Session, method_id: int, data: MethodUpdate) -> Method | None:
    method = db.get(Method, method_id)
    if not method:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(method, field, value)
    db.commit()
    db.refresh(method)
    return method


def delete_person(db: Session, method_id: int) -> bool:
    method = db.get(Method, method_id)
    if not method:
        return False
    db.delete(method)
    db.commit()
    return True