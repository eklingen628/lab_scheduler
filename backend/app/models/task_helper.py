from app.db import Base
from sqlalchemy import Table, Column, Integer, ForeignKey

task_helpers = Table(
    "task_helpers",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
)
