from app.db import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey



#These are the per-method templated tasks
class MethodTask(Base):
    __tablename__ = "method_tasks"
    id = Column(Integer, primary_key=True)
    method_id = Column(Integer, ForeignKey("methods.id"), nullable=False)
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    equipment = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)
    min_step = Column(Integer)
    max_step = Column(Integer)

