from pydantic import BaseModel, ConfigDict


class DefaultTaskBase(BaseModel):
    type: str | None = None
    name: str | None = None
    description: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    min_step: int | None = None
    max_step: int | None = None


class DefaultTaskCreate(DefaultTaskBase):
    pass


class DefaultTaskRead(DefaultTaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DefaultTaskUpdate(DefaultTaskBase):
    pass