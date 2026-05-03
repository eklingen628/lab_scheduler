from pydantic import BaseModel, ConfigDict


class SampleTestGroupBase(BaseModel):
    pass


class SampleTestGroupCreate(SampleTestGroupBase):
    template_ids: list[int]


class SampleTestGroupRead(SampleTestGroupBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SampleTestGroupUpdate(SampleTestGroupBase):
    pass