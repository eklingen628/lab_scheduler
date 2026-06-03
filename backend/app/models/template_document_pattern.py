from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class TemplateDocumentPattern(Base):
    __tablename__ = "template_document_patterns"
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    document_pattern = Column(String(255), nullable=False)
    template = relationship("Template", back_populates="document_patterns")
