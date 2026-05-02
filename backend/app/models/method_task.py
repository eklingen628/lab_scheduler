from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.method_task_helper import method_task_helpers


#These are the per-method templated tasks
#User may use a default task as a template but then edits details
# and submits to create a method task.
class MethodTask(Base):
    __tablename__ = "method_tasks"
    id = Column(Integer, primary_key=True)
    method_id = Column(Integer, ForeignKey("methods.id"), nullable=False)
    default_task_id = Column(Integer, ForeignKey("default_tasks.id"), nullable=True)
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    equipment = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)
    helpers = relationship("Document", secondary=method_task_helpers)
