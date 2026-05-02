from app.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey


class MethodAlias(Base):
    __tablename__ = "method_aliases"
    id = Column(Integer, ForeignKey("methods.id"), primary_key=True)
    alias = Column(String(255))

    

