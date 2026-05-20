from app.db import Base
from sqlalchemy import Column, Integer, String, Float


# Common default task values. Used to prefill the TemplateTask form on the frontend.
# Not referenced at read time; TemplateTask owns its fields independently after creation.
# The default_task_id FK on TemplateTask is stored for provenance only.
class DefaultTask(Base):
    __tablename__ = 'default_tasks'
    id = Column(Integer, primary_key=True)
    type = Column(String(255))
    name = Column(String(255))
    description = Column(String(255))
    base_time = Column(Float)
    time_per_replicate = Column(Float)



