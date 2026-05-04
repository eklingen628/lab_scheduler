from sqlalchemy.orm import Session
from app.models.template_task import TemplateTask
from app.schemas.template_task import TemplateTaskCreate, TemplateTaskUpdate


def create(db: Session, data: TemplateTaskCreate) -> TemplateTask:
    template_task = TemplateTask(**data.model_dump())
    db.add(template_task)
    db.commit()
    db.refresh(template_task)
    return template_task


def get_template_tasks(db: Session) -> list[TemplateTask]:
    return db.query(TemplateTask).all()


def get_template_task(db: Session, template_task_id: int) -> TemplateTask:
    return db.get(TemplateTask, template_task_id)


def update_template_task(db: Session, template_task_id: int, data: TemplateTaskUpdate) -> TemplateTask | None:
    template_task = db.get(TemplateTask, template_task_id)
    if not template_task:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(template_task, field, value)
    db.commit()
    db.refresh(template_task)
    return template_task


def delete_template_task(db: Session, template_task_id: int) -> bool:
    template_task = db.get(TemplateTask, template_task_id)
    if not template_task:
        return False
    db.delete(template_task)
    db.commit()
    return True
