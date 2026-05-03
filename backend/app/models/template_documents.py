from app.db import Base
from sqlalchemy import Table, Column, Integer, ForeignKey


# Documents the Template as a whole matches against. 
# Used by the search to score templates against a test group's method_list and other_testing_documents
template_documents = Table(
    "template_documents",
    Base.metadata,
    Column("template_id", Integer, ForeignKey("template_tasks.id"), primary_key=True),
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
)
