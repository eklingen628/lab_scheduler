from pydantic import BaseModel, ConfigDict, Field
from app.schemas.task import TaskRead
from app.schemas.sample_test import SampleTestRead


class SampleTestGroupBase(BaseModel):
    pass


class SampleTestGroupCreate(SampleTestGroupBase):
    template_ids: list[int] = Field(min_length=1)
    sample_test_ids: list[int]





class SampleTestGroupRead(SampleTestGroupBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SampleTestGroupWithTasksRead(SampleTestGroupBase):
    id: int
    tasks: list[TaskRead]
    sample_tests: list[SampleTestRead]
    


class SampleTestGroupUpdate(SampleTestGroupBase):
    pass