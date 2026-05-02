from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    doc_legacy_id: str
    type: str | None = None
    title: str | None = None


class DocumentCreate(DocumentBase):
    pass


class DocumentRead(DocumentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DocumentUpdate(BaseModel):
    doc_legacy_id: str | None = None
    type: str | None = None
    title: str | None = None
