from datetime import date
from typing import List
from sqlalchemy.orm import Session
from models import Badge, UserBadge, UserStats, Checkin
from services.streak_service import get_checkin_dates, calculate_current_streak, calculate_longest_streak


# ─── Default Badges ──────────────────────────────────────────────────────────

DEFAULT_BADGES = [
    {"name": "First Step", "description": "Complete your very first check-in", "icon": "🌱", "xp_reward": 50, "criteria_type": "total_checkins", "criteria_value": 1, "rarity": "common"},
    {"name": "Week Warrior", "description": "Maintain a 7-day streak on any habit", "icon": "🔥", "xp_reward": 150, "criteria_type": "streak", "criteria_value": 7, "rarity": "common"},
    {"name": "Fortnight Fighter", "description": "Maintain a 14-day streak on any habit", "icon": "⚡", "xp_reward": 300, "criteria_type": "streak", "criteria_value": 14, "rarity": "rare"},
    {"name": "Monthly Legend", "description": "Maintain a 30-day streak on any habit", "icon": "🏆", "xp_reward": 750, "criteria_type": "streak", "criteria_value": 30, "rarity": "epic"},
    {"name": "Century Club", "description": "Maintain a 100-day streak", "icon": "💯", "xp_reward": 2000, "criteria_type": "streak", "criteria_value": 100, "rarity": "legendary"},
    {"name": "Habit Collector", "description": "Track 5 different habits", "icon": "🎯", "xp_reward": 200, "criteria_type": "habit_count", "criteria_value": 5, "rarity": "common"},
    {"name": "Century Checkins", "description": "Complete 100 total check-ins", "icon": "✅", "xp_reward": 500, "criteria_type": "total_checkins", "criteria_value": 100, "rarity": "rare"},
    {"name": "Consistent Soul", "description": "Complete 500 total check-ins", "icon": "🌟", "xp_reward": 1500, "criteria_type": "total_checkins", "criteria_value": 500, "rarity": "epic"},
    {"name": "Mindful Mover", "description": "Track habits in 3 different categories", "icon": "🧘", "xp_reward": 250, "criteria_type": "category_count", "criteria_value": 3, "rarity": "rare"},
    {"name": "Renaissance Hero", "description": "Track habits in 5 different categories", "icon": "🌈", "xp_reward": 600, "criteria_type": "category_count", "criteria_value": 5, "rarity": "epic"},
]


def seed_badges(db: Session):
    """Seed default badges if they don't exist yet."""
    if db.query(Badge).count() == 0:
        for b in DEFAULT_BADGES:
            db.add(Badge(**b))
        db.commit()


def get_or_create_user_stats(db: Session) -> UserStats:
    stats = db.query(UserStats).filter(UserStats.id == 1).first()
    if not stats:
        stats = UserStats(id=1, total_xp=0, total_checkins=0, longest_streak_ever=0)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


def award_xp(db: Session, amount: int):
    stats = get_or_create_user_stats(db)
    stats.total_xp = (stats.total_xp or 0) + amount
    db.commit()


def check_and_award_badges(db: Session, habit_id: int) -> List[Badge]:
    """After a check-in, evaluate all badge criteria and award new badges."""
    from models import Habit
    awarded = []

    all_badges = db.query(Badge).all()
    earned_badge_ids = {ub.badge_id for ub in db.query(UserBadge).all()}

    stats = get_or_create_user_stats(db)
    habit_count = db.query(Habit).filter(Habit.is_active == True).count()
    category_count = db.query(Habit.category).filter(Habit.is_active == True).distinct().count()

    # Get streak for this specific habit
    habit_dates = get_checkin_dates(db, habit_id)
    habit_streak = calculate_current_streak(habit_dates)
    habit_longest = calculate_longest_streak(habit_dates)

    # Update longest ever
    if habit_longest > (stats.longest_streak_ever or 0):
        stats.longest_streak_ever = habit_longest
        db.commit()

    for badge in all_badges:
        if badge.id in earned_badge_ids:
            continue

        earned = False
        if badge.criteria_type == "total_checkins":
            earned = (stats.total_checkins or 0) >= badge.criteria_value
        elif badge.criteria_type == "streak":
            earned = habit_streak >= badge.criteria_value
        elif badge.criteria_type == "habit_count":
            earned = habit_count >= badge.criteria_value
        elif badge.criteria_type == "category_count":
            earned = category_count >= badge.criteria_value

        if earned:
            ub = UserBadge(badge_id=badge.id, habit_id=habit_id)
            db.add(ub)
            award_xp(db, badge.xp_reward)
            awarded.append(badge)

    if awarded:
        db.commit()

    return awarded


def calculate_level(total_xp: int) -> dict:
    """XP thresholds: 0, 500, 1500, 3500, 7500, 15000..."""
    thresholds = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]
    level = 1
    for i, threshold in enumerate(thresholds):
        if total_xp >= threshold:
            level = i + 1
        else:
            break

    current_threshold = thresholds[min(level - 1, len(thresholds) - 1)]
    next_threshold = thresholds[min(level, len(thresholds) - 1)]
    xp_to_next = max(0, next_threshold - total_xp)

    return {
        "level": level,
        "current_threshold": current_threshold,
        "next_threshold": next_threshold,
        "xp_to_next": xp_to_next,
    }
