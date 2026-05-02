from app.db import Base
from sqlalchemy import Table, Column, Integer, ForeignKey

method_task_helpers = Table(
    "method_task_helpers",
    Base.metadata,
    Column("method_task_id", Integer, ForeignKey("method_tasks.id"), primary_key=True),
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
)
