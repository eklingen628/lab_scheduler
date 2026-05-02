from sqlalchemy.orm import Session
from app.models.sample_test import SampleTest
from app.schemas.sample_test import SampleTestCreate, SampleTestUpdate


def create_sample_test(db: Session, data: SampleTestCreate) -> SampleTest:
    sample_test = SampleTest(**data.model_dump())
    db.add(sample_test)
    db.commit()
    db.refresh(sample_test)
    return sample_test


def get_sample_tests(db: Session) -> list[SampleTest]:
    return db.query(SampleTest).all()


def get_sample_test(db: Session, sample_test_id: int) -> SampleTest | None:
    return db.get(SampleTest, sample_test_id)


def get_sample_test_by_key(db: Session, test_key: int) -> SampleTest | None:
    return db.query(SampleTest).filter(SampleTest.test_key == test_key).first()


def update_sample_test(db: Session, sample_test_id: int, data: SampleTestUpdate) -> SampleTest | None:
    sample_test = db.get(SampleTest, sample_test_id)
    if not sample_test:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sample_test, field, value)
    db.commit()
    db.refresh(sample_test)
    return sample_test


def delete_sample_test(db: Session, sample_test_id: int) -> bool:
    sample_test = db.get(SampleTest, sample_test_id)
    if not sample_test:
        return False
    db.delete(sample_test)
    db.commit()
    return True
