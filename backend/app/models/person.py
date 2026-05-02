from app.db import Base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey



class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    username = Column(String(255))