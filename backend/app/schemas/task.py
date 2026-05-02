from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    sample_test_group_id: int | None = None
    method_task_id: int | None = None
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    min_step: int | None = None
    max_step: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskRead(TaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(TaskBase):
    pass