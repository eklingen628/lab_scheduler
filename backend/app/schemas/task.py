from datetime import date
from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    scheduled_date: date | None = None
    person_id: int | None = None
    position: int | None = None
    project: str | None = None
    test_name: str | None = None
    method: str | None = None


class TaskCreate(TaskBase):
    sample_test_group_id: int | None = None


class TaskCreateFromScratch(TaskBase):
    pass


class TaskRead(TaskBase):
    sample_test_group_id: int | None = None
    id: int

    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(TaskBase):
    sample_test_group_id: int | None = None