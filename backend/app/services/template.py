from sqlalchemy.orm import Session
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate


def create_template(db: Session, data: TemplateCreate) -> Template:
    template = Template(**data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def get_templates(db: Session) -> list[Template]:
    return db.query(Template).all()


def get_template(db: Session, template_id: int) -> Template | None:
    return db.get(Template, template_id)


def update_template(db: Session, template_id: int, data: TemplateUpdate) -> Template | None:
    template = db.get(Template, template_id)
    if not template:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(template, field, value)
    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, template_id: int) -> bool:
    template = db.get(Template, template_id)
    if not template:
        return False
    db.delete(template)
    db.commit()
    return True
