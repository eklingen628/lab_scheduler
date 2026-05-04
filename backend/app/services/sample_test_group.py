from sqlalchemy.orm import Session, selectinload
from app.models.sample_test_group import SampleTestGroup
from app.schemas.sample_test_group import SampleTestGroupCreate, SampleTestGroupUpdate
from app.models.template import Template
from app.services.task import create_task
from app.schemas.task import TaskCreate
from app.schemas.sample_test import SampleTestUpdate
from app.models.sample_test import SampleTest
from app.exceptions import NotFoundError


def create_sample_test_group(db: Session, data: SampleTestGroupCreate) -> SampleTestGroup:
    payload = data.model_dump()

    template_ids = payload.pop("template_ids")
    sample_test_ids = payload.pop("sample_test_ids")

    #create the sample test group
    sample_test_group = SampleTestGroup(**payload)
    db.add(sample_test_group)
    db.flush()

    sample_tests = (
        db.query(SampleTest)
        .filter(SampleTest.id.in_(sample_test_ids))
        .all()
    )



    templates = (
        db.query(Template)
        .filter(Template.id.in_(template_ids))
        .options(selectinload(Template.template_tasks))
        .all()
    )


    #for each template Id, create a Task row with copied fields and test_group_id set to the new group
    for template in templates:
        for template_task in template.template_tasks:
            task_create = TaskCreate(
                sample_test_group_id=sample_test_group.id,
                type= template_task.type,
                name=template_task.name,
                description=template_task.description,
                equipment=template_task.equipment,
                base_time=template_task.base_time,
                time_per_replicate=template_task.time_per_replicate,
                min_step=template_task.min_step,
                max_step=template_task.max_step,
            )
            
            create_task(db, task_create, False)



    #for each sample test Id, set its group_id set to the new group
    for sample_test in sample_tests:
        sample_test.group_id = sample_test_group.id
        



    db.commit()




    return sample_test_group


def get_sample_test_groups(db: Session) -> list[SampleTestGroup]:
    return db.query(SampleTestGroup).all()



def get_sample_test_groups_with_tasks(db: Session) -> list[SampleTestGroup]:
    return (
        db.query(SampleTestGroup)
        .options(
            selectinload(SampleTestGroup.tasks),
            selectinload(SampleTestGroup.sample_tests)
        )
        .all()
    )



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


def add_test_to_sample_test_group(db: Session, sample_test_group_id: int, sample_test_id: int):
    sample_test = db.get(SampleTest, sample_test_id)
    if sample_test is None:
        raise NotFoundError("SampleTest not found")
    sample_test.group_id = sample_test_group_id
    db.commit()



def remove_test_from_sample_test_group(db: Session, sample_test_id: int):
    sample_test = db.get(SampleTest, sample_test_id)
    if sample_test is None:
        raise NotFoundError("SampleTest not found")
    sample_test.group_id = None
    db.commit()



