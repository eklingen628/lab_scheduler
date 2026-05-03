from app.db import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app import models


load_dotenv()

app = FastAPI()

from app.routes import (
    person,
    template_task,
    template_test_name_alias,
    default_task,
    task,
    sample_test,
    sample_test_group,
    scheduled_task,
    imports,
)


app.include_router(person.router)
app.include_router(template_task.router)
app.include_router(template_test_name_alias.router)
app.include_router(default_task.router)
app.include_router(task.router)
app.include_router(sample_test.router)
app.include_router(sample_test_group.router)
app.include_router(scheduled_task.router)
app.include_router(imports.router)






origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def main():

    

    return {"message": "Hello World"}