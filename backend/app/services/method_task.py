from sqlalchemy.orm import Session
from app.models.method_task import MethodTask
from app.schemas.method_task import MethodTaskCreate, MethodTaskUpdate


def create(db: Session, data: MethodTaskCreate) -> MethodTask:
    method_task = MethodTask(**data.model_dump())
    db.add(method_task)
    db.commit()
    db.refresh(method_task)
    return method_task


def get_method_tasks(db: Session) -> list[MethodTask]:
    return db.query(MethodTask).all()

def get_method_task(db: Session, method_task_id: int) -> MethodTask:
    return db.get(MethodTask, method_task_id)


def update_method_task(db: Session, method_task_id: int, data: MethodTaskUpdate) -> MethodTask | None:
    method_task = db.get(MethodTask, method_task_id)
    if not method_task:
        return None
    for field, value in data.model_dump():
        setattr(method_task, field, value)
    db.commit()
    db.refresh(method_task)
    return method_task


def delete_method_task(db: Session, method_task_id: int) -> bool:
    method_task = db.get(MethodTask, method_task_id)
    if not method_task:
        return False
    db.delete(method_task)
    db.commit()
    return True

