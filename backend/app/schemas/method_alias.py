from pydantic import BaseModel, ConfigDict


class MethodAliasBase(BaseModel):
    method_id: int
    alias: str


class MethodAliasCreate(MethodAliasBase):
    pass


class MethodAliasRead(MethodAliasBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MethodAliasUpdate(BaseModel):
    method_id: int | None = None
    alias: str | None = None