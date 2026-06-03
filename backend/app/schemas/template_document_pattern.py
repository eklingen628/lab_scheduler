from pydantic import BaseModel, ConfigDict


class TemplateDocumentPatternBase(BaseModel):
    template_id: int
    document_pattern: str


class TemplateDocumentPatternCreate(TemplateDocumentPatternBase):
    pass


class TemplateDocumentPatternRead(TemplateDocumentPatternBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TemplateDocumentPatternUpdate(BaseModel):
    template_id: int | None = None
    document_pattern: str | None = None
