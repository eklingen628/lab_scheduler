from sqlalchemy.orm import Session
from app.models.template_test_name_alias import TemplateTestNameAlias
from app.schemas.template_test_name_alias import TemplateTestNameAliasCreate, TemplateTestNameAliasUpdate


def create_template_test_name_alias(db: Session, data: TemplateTestNameAliasCreate) -> TemplateTestNameAlias:
    alias = TemplateTestNameAlias(**data.model_dump())
    db.add(alias)
    db.commit()
    db.refresh(alias)
    return alias


def get_template_test_name_aliases(db: Session) -> list[TemplateTestNameAlias]:
    return db.query(TemplateTestNameAlias).all()


def get_template_test_name_alias(db: Session, alias_id: int) -> TemplateTestNameAlias | None:
    return db.get(TemplateTestNameAlias, alias_id)


def update_template_test_name_alias(db: Session, alias_id: int, data: TemplateTestNameAliasUpdate) -> TemplateTestNameAlias | None:
    alias = db.get(TemplateTestNameAlias, alias_id)
    if not alias:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(alias, field, value)
    db.commit()
    db.refresh(alias)
    return alias


def delete_template_test_name_alias(db: Session, alias_id: int) -> bool:
    alias = db.get(TemplateTestNameAlias, alias_id)
    if not alias:
        return False
    db.delete(alias)
    db.commit()
    return True
