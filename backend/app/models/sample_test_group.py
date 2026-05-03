from app.db import Base
from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship


class SampleTestGroup(Base):
    __tablename__ = "sample_test_groups"
    id = Column(Integer, primary_key=True)
    tasks = relationship("Task", back_populates="sample_test_group", passive_deletes=True)
    sample_tests = relationship("SampleTest", back_populates="sample_test_group")
    



    

