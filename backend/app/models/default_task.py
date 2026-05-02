from app.db import Base
from sqlalchemy import Column, Integer, String, Float


#Common default task values
class DefaultTask(Base):
    __tablename__ = 'default_tasks'
    id = Column(Integer, primary_key=True)
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)



