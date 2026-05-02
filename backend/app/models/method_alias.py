from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey


class MethodAlias(Base):
    __tablename__ = "method_aliases"
    id = Column(Integer, primary_key=True)
    method_id = Column(Integer, ForeignKey("methods.id"), nullable=False)
    alias = Column(String(255), nullable=False)