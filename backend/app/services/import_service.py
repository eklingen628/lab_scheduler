import io
import pandas as pd
from sqlalchemy.orm import Session
from app.models.sample_test import SampleTest

CSV_COLUMN_MAP = {"method": "method_list"}

CSV_MANAGED_FIELDS = [
    "method_list", "test_key", "project", "sample_id", "subassign", "test_name",
    "due_date", "pull_date", "init_date", "actual_start_date", "available_date",
    "product_group", "employee", "need_pr", "pr_comp", "peer_reviewer",
    "qa_submitted", "interval", "number_of", "status", "gl_assign", "pl_assign",
    "client", "spec_sheet", "temp", "rh", "notebook_ref", "reference_id",
    "other_testing_documents", "legacy_documents", "comments", "sp", "sa", "spa",
]

_DATE_FIELDS = {"due_date", "pull_date", "init_date", "actual_start_date", "available_date"}
_BOOL_FIELDS = {"need_pr", "pr_comp", "qa_submitted"}
_INT_FIELDS = {"test_key", "number_of", "sp", "sa", "spa"}


def _to_bool(val: str) -> bool | None:
    if not val.strip():
        return None
    return val.strip().lower() in ("true", "1", "yes")


def _to_date(val: str):
    if not val.strip():
        return None
    return pd.to_datetime(val.strip()).date()


def _to_int(val: str) -> int | None:
    if not val.strip():
        return None
    return int(val.strip())


def _to_str(val: str) -> str | None:
    stripped = val.strip()
    return stripped if stripped else None


def _parse_row(raw: dict) -> dict:
    result = {}
    for csv_col, value in raw.items():
        field = CSV_COLUMN_MAP.get(csv_col, csv_col)
        if field not in CSV_MANAGED_FIELDS:
            continue
        if field in _DATE_FIELDS:
            result[field] = _to_date(value)
        elif field in _BOOL_FIELDS:
            result[field] = _to_bool(value)
        elif field in _INT_FIELDS:
            result[field] = _to_int(value)
        else:
            result[field] = _to_str(value)
    return result


def parse_and_classify(contents: bytes, db: Session) -> list[dict]:
    df = pd.read_csv(io.BytesIO(contents), dtype=str, keep_default_na=False)
    classified = []

    for i, (_, row) in enumerate(df.iterrows(), start=1):
        raw = row.to_dict()
        raw_key = raw.get("test_key", "").strip()

        if not raw_key:
            classified.append({"row": i, "classification": "error", "data": None, "issue": "missing test_key"})
            continue

        try:
            test_key = int(raw_key)
        except ValueError:
            classified.append({"row": i, "classification": "error", "data": None, "issue": f"invalid test_key: {raw_key!r}"})
            continue

        try:
            data = _parse_row(raw)
        except Exception as e:
            classified.append({"row": i, "classification": "error", "data": None, "issue": str(e)})
            continue

        existing = db.query(SampleTest).filter(SampleTest.test_key == test_key).first()
        classification = "update" if existing else "new"
        classified.append({"row": i, "classification": classification, "data": data, "issue": None})

    return classified


def commit_rows(classified: list[dict], db: Session) -> dict:
    inserted = updated = skipped = 0
    errors = []

    for item in classified:
        if item["classification"] == "error":
            skipped += 1
            continue

        try:
            data = item["data"]
            if item["classification"] == "new":
                db.add(SampleTest(**data))
                db.commit()
                inserted += 1
            else:
                record = db.query(SampleTest).filter(SampleTest.test_key == data["test_key"]).first()
                for field, value in data.items():
                    if field != "test_key":
                        setattr(record, field, value)
                db.commit()
                updated += 1
        except Exception as e:
            db.rollback()
            errors.append({"row": item["row"], "issue": str(e)})

    return {"inserted": inserted, "updated": updated, "skipped": skipped, "errors": errors}
