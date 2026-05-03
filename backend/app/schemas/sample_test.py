from datetime import date
from pydantic import BaseModel, ConfigDict


class SampleTestBase(BaseModel):
    group_id: int | None = None
    test_key: int
    project: str | None = None
    sample_id: str | None = None
    subassign: str | None = None
    test_name: str | None = None
    due_date: date | None = None
    pull_date: date | None = None
    init_date: date | None = None
    actual_start_date: date | None = None
    available_date: date | None = None
    product_group: str | None = None
    employee: str | None = None
    need_pr: bool | None = None
    pr_comp: bool | None = None
    peer_reviewer: str | None = None
    qa_submitted: bool | None = None
    interval: str | None = None
    method_list: str | None = None
    number_of: int | None = None
    status: str | None = None
    gl_assign: str | None = None
    pl_assign: str | None = None
    client: str | None = None
    spec_sheet: str | None = None
    temp: str | None = None
    rh: str | None = None
    notebook_ref: str | None = None
    reference_id: str | None = None
    other_testing_documents: str | None = None
    legacy_documents: str | None = None
    comments: str | None = None
    sp: int | None = None
    sa: int | None = None
    spa: int | None = None


class SampleTestCreate(SampleTestBase):
    pass


class SampleTestRead(SampleTestBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SampleTestUpdate(SampleTestBase):
    group_id: int | None = None
    test_key: int | None = None
    project: str | None = None
    sample_id: str | None = None
    subassign: str | None = None
    test_name: str | None = None
    due_date: date | None = None
    pull_date: date | None = None
    init_date: date | None = None
    actual_start_date: date | None = None
    available_date: date | None = None
    product_group: str | None = None
    employee: str | None = None
    need_pr: bool | None = None
    pr_comp: bool | None = None
    peer_reviewer: str | None = None
    qa_submitted: bool | None = None
    interval: str | None = None
    method_legacy_ids: str | None = None
    number_of: int | None = None
    status: str | None = None
    gl_assign: str | None = None
    pl_assgin: str | None = None
    client: str | None = None
    spec_sheet: str | None = None
    temp: str | None = None
    rh: str | None = None
    notebook_ref: str | None = None
    reference_id: str | None = None
    other_testing_documents: str | None = None
    legacy_documents: str | None = None
    comments: str | None = None
    sp: int | None = None
    sa: int | None = None
    spa: int | None = None