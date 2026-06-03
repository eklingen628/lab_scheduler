from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship


class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    description = Column(String(255))
    template_tasks = relationship("TemplateTask", back_populates="template", cascade="all, delete-orphan")
    test_name_aliases = relationship("TemplateTestNameAlias", back_populates="template", cascade="all, delete-orphan")
    document_patterns = relationship("TemplateDocumentPattern", back_populates="template", cascade="all, delete-orphan")

    is_standard = Column(Boolean, default=False, nullable=False)
