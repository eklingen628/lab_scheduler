from sqlalchemy.orm import Session
from app.models.default_task import DefaultTask
from app.schemas.default_task import DefaultTaskCreate, DefaultTaskUpdate


def create_default_task(db: Session, data: DefaultTaskCreate) -> DefaultTask:
    default_task = DefaultTask(**data.model_dump())
    db.add(default_task)
    db.commit()
    db.refresh(default_task)
    return default_task


def get_default_tasks(db: Session) -> list[DefaultTask]:
    return db.query(DefaultTask).all()


def get_default_task(db: Session, default_task_id: int) -> DefaultTask | None:
    return db.get(DefaultTask, default_task_id)


def update_default_task(db: Session, default_task_id: int, data: DefaultTaskUpdate) -> DefaultTask | None:
    default_task = db.get(DefaultTask, default_task_id)
    if not default_task:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(default_task, field, value)
    db.commit()
    db.refresh(default_task)
    return default_task


def delete_default_task(db: Session, default_task_id: int) -> bool:
    default_task = db.get(DefaultTask, default_task_id)
    if not default_task:
        return False
    db.delete(default_task)
    db.commit()
    return True