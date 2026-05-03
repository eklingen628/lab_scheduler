from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db import get_db
from app.services import import_service

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/sample-tests/preview")
async def preview_sample_tests(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    classified = import_service.parse_and_classify(contents, db)

    errors = [{"row": r["row"], "issue": r["issue"]} for r in classified if r["classification"] == "error"]
    return {
        "total_rows": len(classified),
        "new_count": sum(1 for r in classified if r["classification"] == "new"),
        "update_count": sum(1 for r in classified if r["classification"] == "update"),
        "error_count": len(errors),
        "errors": errors,
    }


@router.post("/sample-tests/commit")
async def commit_sample_tests(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    classified = import_service.parse_and_classify(contents, db)
    return import_service.commit_rows(classified, db)
