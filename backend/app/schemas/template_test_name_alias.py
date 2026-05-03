from pydantic import BaseModel, ConfigDict


class TemplateTestNameAliasBase(BaseModel):
    template_id: int
    test_name_pattern: str


class TemplateTestNameAliasCreate(TemplateTestNameAliasBase):
    pass


class TemplateTestNameAliasRead(TemplateTestNameAliasBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TemplateTestNameAliasUpdate(BaseModel):
    template_id: int | None = None
    test_name_pattern: str | None = None
