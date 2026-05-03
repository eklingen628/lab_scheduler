from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.template_task_helper import template_task_helpers


# Per-template tasks. User may prefill from a default task but edits fields
# independently; default_task_id is stored for provenance only.
class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    description = Column(String(255))
