from pydantic import BaseModel, ConfigDict


class TemplateBase(BaseModel):
    name: str | None = None
    description: str | None = None


class TemplateCreate(TemplateBase):
    pass


class TemplateRead(TemplateBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TemplateUpdate(TemplateBase):
    pass
