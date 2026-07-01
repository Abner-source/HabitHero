from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from models import Habit
from schemas import HabitCreate, HabitUpdate, HabitResponse
from services.streak_service import get_checkin_dates, calculate_current_streak
from models import Checkin

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=List[HabitResponse])
def list_habits(target_date: Optional[date] = None, db: Session = Depends(get_db)):
    habits = db.query(Habit).filter(Habit.is_active == True).order_by(Habit.created_at.desc()).all()
    result = []
    query_date = target_date or date.today()
    for h in habits:
        dates = get_checkin_dates(db, h.id)
        streak = calculate_current_streak(dates)
        today_ci = db.query(Checkin).filter(
            Checkin.habit_id == h.id,
            Checkin.date == query_date,
            Checkin.completed == True,
        ).first()
        r = HabitResponse.model_validate(h)
        r.streak = streak
        r.today_completed = today_ci is not None
        result.append(r)
    return result


@router.post("", response_model=HabitResponse, status_code=201)
def create_habit(payload: HabitCreate, db: Session = Depends(get_db)):
    habit = Habit(**payload.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    r = HabitResponse.model_validate(habit)
    r.streak = 0
    r.today_completed = False
    return r


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    dates = get_checkin_dates(db, habit_id)
    streak = calculate_current_streak(dates)
    today = date.today()
    today_ci = db.query(Checkin).filter(
        Checkin.habit_id == habit_id,
        Checkin.date == today,
        Checkin.completed == True,
    ).first()
    r = HabitResponse.model_validate(habit)
    r.streak = streak
    r.today_completed = today_ci is not None
    return r


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, payload: HabitUpdate, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(habit, field, value)
    db.commit()
    db.refresh(habit)
    dates = get_checkin_dates(db, habit_id)
    r = HabitResponse.model_validate(habit)
    r.streak = calculate_current_streak(dates)
    return r


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    habit.is_active = False  # soft delete
    db.commit()
