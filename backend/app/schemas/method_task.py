from pydantic import BaseModel, ConfigDict


class MethodTaskBase(BaseModel):
    method_id: int
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    min_step: int | None = None
    max_step: int | None = None


class MethodTaskCreate(MethodTaskBase):
    pass


class MethodTaskRead(MethodTaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MethodTaskUpdate(BaseModel):
    method_id: int | None = None
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    min_step: int | None = None
    max_step: int | None = None