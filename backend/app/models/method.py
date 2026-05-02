from app.db import Base
from sqlalchemy import Column, Integer, String


class Method(Base):
    __tablename__ = 'methods'
    id = Column(Integer, primary_key=True)
    method_legacy_id = Column(String(255))
    client = Column(String(255))
    


