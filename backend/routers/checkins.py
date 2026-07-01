from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from database import get_db
from models import Checkin, Habit
from schemas import CheckinCreate, CheckinResponse, CheckinNoteResponse
from services.ai_service import analyze_mood
from services.badge_service import check_and_award_badges, award_xp, get_or_create_user_stats

router = APIRouter(prefix="/habits", tags=["checkins"])

XP_PER_CHECKIN = 10


@router.get("/notes", response_model=List[CheckinNoteResponse])
def get_all_notes(db: Session = Depends(get_db)):
    return (
        db.query(Checkin)
        .filter(Checkin.notes.isnot(None), Checkin.notes != "")
        .order_by(Checkin.date.desc())
        .all()
    )


@router.get("/{habit_id}/checkins", response_model=List[CheckinResponse])
def get_checkins(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    checkins = (
        db.query(Checkin)
        .filter(Checkin.habit_id == habit_id)
        .order_by(Checkin.date.desc())
        .all()
    )
    return checkins


@router.post("/{habit_id}/checkin", response_model=CheckinResponse, status_code=201)
def create_checkin(habit_id: int, payload: CheckinCreate, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Check for duplicate
    existing = db.query(Checkin).filter(
        Checkin.habit_id == habit_id,
        Checkin.date == payload.date,
    ).first()
    if existing:
        # Update existing check-in
        existing.completed = payload.completed
        existing.notes = payload.notes
        if payload.notes:
            existing.mood_score = analyze_mood(payload.notes)
        db.commit()
        db.refresh(existing)
        return existing

    mood_score = analyze_mood(payload.notes) if payload.notes else None

    checkin = Checkin(
        habit_id=habit_id,
        date=payload.date,
        completed=payload.completed,
        notes=payload.notes,
        mood_score=mood_score,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    # Award XP and check badges
    if payload.completed:
        stats = get_or_create_user_stats(db)
        stats.total_checkins = (stats.total_checkins or 0) + 1
        db.commit()
        award_xp(db, XP_PER_CHECKIN)
        check_and_award_badges(db, habit_id)

    return checkin


@router.delete("/{habit_id}/checkin/{checkin_date}", status_code=204)
def delete_checkin(habit_id: int, checkin_date: date, db: Session = Depends(get_db)):
    checkin = db.query(Checkin).filter(
        Checkin.habit_id == habit_id,
        Checkin.date == checkin_date,
    ).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    db.delete(checkin)
    db.commit()
