from sqlalchemy.orm import Session, selectinload
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate
from app.models.template_task import TemplateTask
from app.models.template_test_name_alias import TemplateTestNameAlias
from app.models.template_document_pattern import TemplateDocumentPattern

def create_template(db: Session, data: TemplateCreate) -> Template:
    template = Template(**data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def copy_template(db: Session, template_id: int) -> Template | None:
    template = (
        db.query(Template)
        .filter(Template.id == template_id)
        .options(selectinload(Template.template_tasks),
                 selectinload(Template.test_name_aliases),
                 selectinload(Template.document_patterns)
                 )
        .first()
    )

    new_template = Template(
        name=template.name,
        description=template.description,
        is_standard=template.is_standard,
    )

    db.add(new_template)
    db.flush()

    for tt in template.template_tasks:
        data = {k: v for k, v in tt.__dict__.items() if k not in ('id', 'template_id', '_sa_instance_state')}
        new_tt = TemplateTask(**data, template_id=new_template.id)
        db.add(new_tt)

    for ta in template.test_name_aliases:
        data = {k: v for k, v in ta.__dict__.items() if k not in ('id', 'template_id', '_sa_instance_state')}
        new_ta = TemplateTestNameAlias(**data, template_id=new_template.id)
        db.add(new_ta)

    for dp in template.document_patterns:
        data = {k: v for k, v in dp.__dict__.items() if k not in ('id', 'template_id', '_sa_instance_state')}
        new_dp = TemplateDocumentPattern(**data, template_id=new_template.id)
        db.add(new_dp)

    db.commit()
    return new_template




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
