from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Badge, UserBadge
from schemas import BadgeResponse, UserStatsResponse
from services.badge_service import get_or_create_user_stats, calculate_level

router = APIRouter(prefix="/badges", tags=["badges"])


@router.get("", response_model=List[BadgeResponse])
def get_all_badges(db: Session = Depends(get_db)):
    badges = db.query(Badge).order_by(Badge.xp_reward).all()
    earned_map = {
        ub.badge_id: ub.earned_at
        for ub in db.query(UserBadge).all()
    }
    result = []
    for b in badges:
        r = BadgeResponse.model_validate(b)
        r.earned = b.id in earned_map
        r.earned_at = earned_map.get(b.id)
        result.append(r)
    return result


@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(db: Session = Depends(get_db)):
    stats = get_or_create_user_stats(db)
    level_info = calculate_level(stats.total_xp or 0)
    badges_earned = db.query(UserBadge).count()

    return UserStatsResponse(
        total_xp=stats.total_xp or 0,
        level=level_info["level"],
        xp_to_next_level=level_info["xp_to_next"],
        total_checkins=stats.total_checkins or 0,
        longest_streak_ever=stats.longest_streak_ever or 0,
        badges_earned=badges_earned,
    )
