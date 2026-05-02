from datetime import date
from pydantic import BaseModel, ConfigDict


class ScheduledTaskBase(BaseModel):
    task_id: int | None = None
    scheduled_date: date | None = None
    person_id: int | None = None
    position: int | None = None


class ScheduledTaskCreate(ScheduledTaskBase):
    pass


class ScheduledTaskRead(ScheduledTaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ScheduledTaskUpdate(ScheduledTaskBase):
    pass