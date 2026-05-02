from sqlalchemy.orm import Session
from app.models.sample_test_group import SampleTestGroup
from app.schemas.sample_test_group import SampleTestGroupCreate, SampleTestGroupUpdate


def create_sample_test_group(db: Session, data: SampleTestGroupCreate) -> SampleTestGroup:
    sample_test_group = SampleTestGroup(**data.model_dump())
    db.add(sample_test_group)
    db.commit()
    db.refresh(sample_test_group)
    return sample_test_group


def get_sample_test_groups(db: Session) -> list[SampleTestGroup]:
    return db.query(SampleTestGroup).all()


def get_sample_test_group(db: Session, sample_test_group_id: int) -> SampleTestGroup | None:
    return db.get(SampleTestGroup, sample_test_group_id)


def update_sample_test_group(db: Session, sample_test_group_id: int, data: SampleTestGroupUpdate) -> SampleTestGroup | None:
    sample_test_group = db.get(SampleTestGroup, sample_test_group_id)
    if not sample_test_group:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sample_test_group, field, value)
    db.commit()
    db.refresh(sample_test_group)
    return sample_test_group


def delete_sample_test_group(db: Session, sample_test_group_id: int) -> bool:
    sample_test_group = db.get(SampleTestGroup, sample_test_group_id)
    if not sample_test_group:
        return False
    db.delete(sample_test_group)
    db.commit()
    return True
