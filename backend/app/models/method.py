from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey


class Method(Base):
    __tablename__ = 'methods'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
