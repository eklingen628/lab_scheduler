from app.db import Base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey



class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    scheduled_date = Column(Date)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    position = Column(Integer)