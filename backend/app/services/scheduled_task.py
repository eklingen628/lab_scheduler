from sqlalchemy.orm import Session
from app.models.scheduled_task import ScheduledTask
from app.schemas.scheduled_task import ScheduledTaskCreate, ScheduledTaskUpdate


def create_scheduled_task(db: Session, data: ScheduledTaskCreate) -> ScheduledTask:
    scheduled_task = ScheduledTask(**data.model_dump())
    db.add(scheduled_task)
    db.commit()
    db.refresh(scheduled_task)
    return scheduled_task


def get_scheduled_tasks(db: Session) -> list[ScheduledTask]:
    return db.query(ScheduledTask).all()


def get_scheduled_task(db: Session, scheduled_task_id: int) -> ScheduledTask | None:
    return db.get(ScheduledTask, scheduled_task_id)


def update_scheduled_task(db: Session, scheduled_task_id: int, data: ScheduledTaskUpdate) -> ScheduledTask | None:
    scheduled_task = db.get(ScheduledTask, scheduled_task_id)
    if not scheduled_task:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(scheduled_task, field, value)
    db.commit()
    db.refresh(scheduled_task)
    return scheduled_task


def delete_scheduled_task(db: Session, scheduled_task_id: int) -> bool:
    scheduled_task = db.get(ScheduledTask, scheduled_task_id)
    if not scheduled_task:
        return False
    db.delete(scheduled_task)
    db.commit()
    return True
