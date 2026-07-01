from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from collections import defaultdict

from database import get_db
from models import Habit, Checkin
from schemas import HabitAnalytics, OverviewAnalytics
from services.streak_service import (
    get_checkin_dates,
    calculate_current_streak,
    calculate_longest_streak,
    calculate_success_rate,
    get_best_day,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/habits/{habit_id}", response_model=HabitAnalytics)
def get_habit_analytics(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Habit not found")

    dates = get_checkin_dates(db, habit_id)
    return HabitAnalytics(
        habit_id=habit_id,
        habit_name=habit.name,
        current_streak=calculate_current_streak(dates),
        longest_streak=calculate_longest_streak(dates),
        total_checkins=len(dates),
        success_rate=calculate_success_rate(habit, dates),
        best_day=get_best_day(dates),
        checkin_dates=[d.isoformat() for d in sorted(dates)],
    )


@router.get("/overview", response_model=OverviewAnalytics)
def get_overview(db: Session = Depends(get_db)):
    habits = db.query(Habit).filter(Habit.is_active == True).all()
    today = date.today()

    total_checkins = 0
    best_streak = 0
    today_completed = 0
    category_counts = defaultdict(int)

    for h in habits:
        dates = get_checkin_dates(db, h.id)
        total_checkins += len(dates)
        streak = calculate_current_streak(dates)
        best_streak = max(best_streak, streak)
        category_counts[h.category] += 1

        if today in set(dates):
            today_completed += 1

    # Overall success rate
    all_habits_rates = []
    for h in habits:
        dates = get_checkin_dates(db, h.id)
        rate = calculate_success_rate(h, dates)
        all_habits_rates.append(rate)
    overall_rate = round(sum(all_habits_rates) / len(all_habits_rates), 1) if all_habits_rates else 0.0

    # Weekly checkins (last 7 days)
    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(Checkin).filter(
            Checkin.date == day,
            Checkin.completed == True,
        ).count()
        weekly.append({"date": day.isoformat(), "day": day.strftime("%a"), "count": count})

    return OverviewAnalytics(
        total_habits=len(habits),
        active_habits=len(habits),
        total_checkins=total_checkins,
        overall_success_rate=overall_rate,
        best_streak=best_streak,
        today_completed=today_completed,
        category_breakdown=dict(category_counts),
        weekly_checkins=weekly,
    )
