from app.db import Base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

# A test is "staged" if it has a sample_test_group_id.


class SampleTest(Base):
    __tablename__ = 'sample_tests'
    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("sample_test_groups.id"), nullable=True)
    sample_test_group = relationship("SampleTestGroup", back_populates="sample_tests")
    test_key = Column(Integer, unique=True, index=True, nullable=False)
    
    project = Column(String(255))
    sample_id = Column(String(255))
    subassign = Column(String(255))
    test_name = Column(String(255))
    due_date = Column(Date)
    pull_date = Column(Date)
    init_date = Column(Date)
    actual_start_date = Column(Date)
    available_date = Column(Date)
    product_group = Column(String(255))
    employee = Column(String(255))
    need_pr = Column(Boolean)
    pr_comp = Column(Boolean)
    peer_reviewer = Column(String(255))
    qa_submitted = Column(Boolean)
    interval = Column(String(255))
    method = Column(String(255))
    number_of = Column(Integer)
    status = Column(String(255))
    gl_assign = Column(String(255))
    pl_assign = Column(String(255))
    client = Column(String(255))
    spec_sheet = Column(String(255))
    temp = Column(String(255))
    rh = Column(String(255))
    notebook_ref = Column(String(255))
    reference_id = Column(String(255))
    other_testing_documents = Column(String(255))
    legacy_documents = Column(String(255))
    comments = Column(Text)
    sp = Column(Integer)
    sa = Column(Integer)
    spa = Column(Integer)


    

