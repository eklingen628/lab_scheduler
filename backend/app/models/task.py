from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.task_helper import task_helpers


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    sample_test_group_id = Column(Integer, ForeignKey("sample_test_groups.id"))
    method_task_id = Column(Integer, ForeignKey("method_tasks.id"))
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    equipment = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)
    helpers = relationship("Document", secondary=task_helpers)
