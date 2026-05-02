from app.db import Base
from sqlalchemy import Column, Integer, String, Date, Boolean


class SampleTestGroup(Base):
    __tablename__ = "sample_test_groups"
    id = Column(Integer, primary_key=True)
    test_key = Column(Integer)
    



    

