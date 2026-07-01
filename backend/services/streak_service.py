from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from models import Checkin, Habit


def get_checkin_dates(db: Session, habit_id: int) -> List[date]:
    """Return sorted list of all completed check-in dates for a habit."""
    rows = (
        db.query(Checkin.date)
        .filter(Checkin.habit_id == habit_id, Checkin.completed == True)
        .order_by(Checkin.date)
        .all()
    )
    return [r.date for r in rows]


def calculate_current_streak(dates: List[date]) -> int:
    """Calculate the current streak ending on today or yesterday."""
    if not dates:
        return 0

    sorted_dates = sorted(set(dates), reverse=True)
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Streak must include today or yesterday
    if sorted_dates[0] not in (today, yesterday):
        return 0

    streak = 1
    for i in range(1, len(sorted_dates)):
        expected = sorted_dates[i - 1] - timedelta(days=1)
        if sorted_dates[i] == expected:
            streak += 1
        else:
            break
    return streak


def calculate_longest_streak(dates: List[date]) -> int:
    """Calculate the all-time longest streak."""
    if not dates:
        return 0

    sorted_dates = sorted(set(dates))
    max_streak = 1
    current = 1

    for i in range(1, len(sorted_dates)):
        expected = sorted_dates[i - 1] + timedelta(days=1)
        if sorted_dates[i] == expected:
            current += 1
            max_streak = max(max_streak, current)
        else:
            current = 1

    return max_streak


def calculate_success_rate(habit: Habit, checkin_dates: List[date]) -> float:
    """Calculate % of scheduled days that were completed since start_date."""
    today = date.today()
    start = habit.start_date

    if start > today:
        return 0.0

    if habit.frequency == "daily":
        total_days = (today - start).days + 1
    else:
        # weekly — count number of weeks
        total_days = max(1, ((today - start).days // 7) + 1)

    if total_days == 0:
        return 0.0

    completed = len(set(checkin_dates))
    return min(100.0, round((completed / total_days) * 100, 1))


def get_best_day(checkin_dates: List[date]) -> Optional[str]:
    """Return the day of week with most check-ins."""
    if not checkin_dates:
        return None

    day_counts = {}
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for d in checkin_dates:
        day = day_names[d.weekday()]
        day_counts[day] = day_counts.get(day, 0) + 1

    return max(day_counts, key=day_counts.get)
