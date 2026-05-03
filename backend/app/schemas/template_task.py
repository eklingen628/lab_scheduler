from pydantic import BaseModel, ConfigDict
from app.schemas.document import DocumentRead


class TemplateTaskBase(BaseModel):
    template_id: int | None = None
    default_task_id: int | None = None
    type: str | None = None
    name: str | None = None
    description: str | None = None
    equipment: str | None = None
    base_time: float | None = None
    time_per_replicate: float | None = None
    min_step: int | None = None
    max_step: int | None = None


class TemplateTaskCreate(TemplateTaskBase):
    template_id: int
    helper_document_ids: list[int] = []


class TemplateTaskRead(TemplateTaskBase):
    id: int
    helpers: list[DocumentRead] = []

    model_config = ConfigDict(from_attributes=True)


class TemplateTaskUpdate(TemplateTaskBase):
    helper_document_ids: list[int] | None = None
