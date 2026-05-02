from app.db import Base
from sqlalchemy import Column, Integer, String


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    doc_legacy_id = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(50))
    title = Column(String(255))
    client = Column(String(255))
