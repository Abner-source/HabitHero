from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import get_db
from models import Habit, Checkin
from schemas import HabitSuggestion, QuoteResponse, MoodTrend
from services.ai_service import get_daily_quote, get_suggestions, analyze_mood

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/quote", response_model=QuoteResponse)
def get_quote():
    day_of_year = date.today().timetuple().tm_yday
    q = get_daily_quote(day_of_year)
    return QuoteResponse(**q)


@router.get("/suggestions", response_model=List[HabitSuggestion])
def get_habit_suggestions(db: Session = Depends(get_db)):
    # Calculate average mood from recent checkins
    checkins = (
        db.query(Checkin)
        .filter(Checkin.notes != None, Checkin.mood_score != None)
        .order_by(Checkin.date.desc())
        .limit(30)
        .all()
    )
    scores = [c.mood_score for c in checkins if c.mood_score is not None]
    avg_mood = round(sum(scores) / len(scores), 2) if scores else 0.0

    existing = db.query(Habit.category).filter(Habit.is_active == True).all()
    categories = [row.category for row in existing]
    
    raw = get_suggestions(categories, avg_mood)
    return [HabitSuggestion(**s) for s in raw]


@router.get("/mood-trend", response_model=MoodTrend)
def get_mood_trend(db: Session = Depends(get_db)):
    checkins = (
        db.query(Checkin)
        .filter(Checkin.notes != None, Checkin.mood_score != None)
        .order_by(Checkin.date.desc())
        .limit(30)
        .all()
    )

    if not checkins:
        return MoodTrend(
            period="last 30 days",
            average_mood=0.0,
            trend="stable",
            dominant_emotion="neutral",
            data_points=[],
        )

    scores = [c.mood_score for c in checkins if c.mood_score is not None]
    avg = round(sum(scores) / len(scores), 2) if scores else 0.0

    # Trend: compare first half vs second half
    mid = len(scores) // 2
    if mid > 0:
        first_half = sum(scores[mid:]) / len(scores[mid:])
        second_half = sum(scores[:mid]) / len(scores[:mid])
        if second_half > first_half + 0.1:
            trend = "improving"
        elif second_half < first_half - 0.1:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"

    # Dominant emotion
    if avg > 0.3:
        dominant = "positive 😊"
    elif avg < -0.3:
        dominant = "stressed 😔"
    else:
        dominant = "neutral 😐"

    data_points = [
        {"date": c.date.isoformat(), "score": c.mood_score, "notes": c.notes}
        for c in reversed(checkins)
    ]

    return MoodTrend(
        period="last 30 days",
        average_mood=avg,
        trend=trend,
        dominant_emotion=dominant,
        data_points=data_points,
    )
