from pydantic import BaseModel, ConfigDict



class MethodBase(BaseModel):
    method_legacy_id: str | None = None
    client: str | None = None
    document_id: int | None = None


class MethodCreate(MethodBase):
    pass


class MethodRead(MethodBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MethodUpdate(MethodBase):
    pass
