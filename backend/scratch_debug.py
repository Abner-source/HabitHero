import sys
import os
from sqlalchemy.orm import Session

# Add current path to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Checkin
from schemas import CheckinNoteResponse

db = SessionLocal()
try:
    notes = (
        db.query(Checkin)
        .filter(Checkin.notes.isnot(None), Checkin.notes != "")
        .order_by(Checkin.date.desc())
        .all()
    )
    print(f"Found {len(notes)} notes.")
    for n in notes:
        try:
            validated = CheckinNoteResponse.model_validate(n)
            print(f"Validated note {validated.id} successfully.")
        except Exception as ve:
            print(f"Validation error for note {n.id}:")
            print(ve)
finally:
    db.close()
