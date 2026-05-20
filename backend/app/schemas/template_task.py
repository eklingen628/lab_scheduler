from pydantic import BaseModel, ConfigDict


class TemplateTaskBase(BaseModel):
    template_id: int | None = None
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None


class TemplateTaskCreate(TemplateTaskBase):
    template_id: int


class TemplateTaskRead(TemplateTaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TemplateTaskUpdate(TemplateTaskBase):
    pass
