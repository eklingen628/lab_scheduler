from sqlalchemy.orm import Session
from app.models.method_alias import MethodAlias
from app.schemas.method_alias import MethodAliasCreate, MethodAliasUpdate


def create_method_alias(db: Session, data: MethodAliasCreate) -> MethodAlias:
    method_alias = MethodAlias(**data.model_dump())
    db.add(method_alias)
    db.commit()
    db.refresh(method_alias)
    return method_alias


def get_method_aliases(db: Session) -> list[MethodAlias]:
    return db.query(MethodAlias).all()


def get_method_alias(db: Session, method_alias_id: int) -> MethodAlias | None:
    return db.get(MethodAlias, method_alias_id)


def update_method_alias(db: Session, method_alias_id: int, data: MethodAliasUpdate) -> MethodAlias | None:
    method_alias = db.get(MethodAlias, method_alias_id)
    if not method_alias:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(method_alias, field, value)
    db.commit()
    db.refresh(method_alias)
    return method_alias


def delete_method_alias(db: Session, method_alias_id: int) -> bool:
    method_alias = db.get(MethodAlias, method_alias_id)
    if not method_alias:
        return False
    db.delete(method_alias)
    db.commit()
    return True
