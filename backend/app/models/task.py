from app.db import Base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    sample_test_group_id = Column(Integer, ForeignKey("sample_test_groups.id", ondelete="CASCADE"))
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    equipment = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)
    scheduled_date = Column(Date, nullable=True)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    position = Column(Integer, nullable=True)
    sample_test_group = relationship("SampleTestGroup", back_populates="tasks")
    person = relationship("Person")
