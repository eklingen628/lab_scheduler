from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class TemplateTestNameAlias(Base):
    __tablename__ = "template_test_name_aliases"
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    test_name_pattern = Column(String(255), nullable=False)
    template = relationship("Template", back_populates="test_name_aliases")
