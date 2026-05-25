from sqlalchemy.orm import Session, selectinload
from sqlalchemy.sql.expression import and_
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskCreateFromScratch
from app.exceptions import DateRangeError
from datetime import date


def create_task_from_group(db: Session, data: TaskCreate) -> Task | None:
    task = Task(**data.model_dump())
    db.add(task)
    return None



def create_task_from_scratch(db: Session, data: TaskCreateFromScratch) -> Task | None:
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    return task


def get_tasks(db: Session) -> list[Task]:
    return db.query(Task).all()


def get_tasks_date_range(db: Session, start: date, end: date) -> list[Task]:
    if end < start:
        raise DateRangeError("Invalid date range, end is before start")
    return (
        db.query(Task)
        .filter(and_(Task.scheduled_date >= start, Task.scheduled_date <= end))
        .options(selectinload(Task.person), selectinload(Task.sample_test_group))
        .order_by(Task.position.nullslast())
        .all()
    )


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def update_task(db: Session, task_id: int, data: TaskUpdate) -> Task | None:
    task = db.get(Task, task_id)
    if not task:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> bool:
    task = db.get(Task, task_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True