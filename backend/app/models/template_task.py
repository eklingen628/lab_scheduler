from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship


# Per-template tasks. User may prefill from a default task but edits fields
# independently; default_task_id is stored for provenance only.
class TemplateTask(Base):
    __tablename__ = "template_tasks"
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    equipment = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)
    template = relationship("Template", back_populates="template_tasks")
