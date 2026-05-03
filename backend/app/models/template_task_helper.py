from app.db import Base
from sqlalchemy import Table, Column, Integer, ForeignKey

template_task_helpers = Table(
    "template_task_helpers",
    Base.metadata,
    Column("template_task_id", Integer, ForeignKey("template_tasks.id"), primary_key=True),
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
)
