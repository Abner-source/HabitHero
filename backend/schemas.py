from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class FrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"


class CategoryEnum(str, Enum):
    health = "health"
    fitness = "fitness"
    work = "work"
    learning = "learning"
    mental_health = "mental_health"
    productivity = "productivity"
    social = "social"
    finance = "finance"
    creativity = "creativity"
    other = "other"


class RarityEnum(str, Enum):
    common = "common"
    rare = "rare"
    epic = "epic"
    legendary = "legendary"


# ─── Habit Schemas ───────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    frequency: FrequencyEnum = FrequencyEnum.daily
    category: CategoryEnum = CategoryEnum.health
    color: str = Field(default="#7c3aed", pattern=r"^#[0-9a-fA-F]{6}$")
    icon: str = Field(default="⭐", max_length=10)
    start_date: date
    target_days: Optional[int] = Field(default=None, ge=1, le=7)


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    frequency: Optional[FrequencyEnum] = None
    category: Optional[CategoryEnum] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    icon: Optional[str] = Field(None, max_length=10)
    target_days: Optional[int] = Field(None, ge=1, le=7)
    is_active: Optional[bool] = None


class HabitResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    frequency: str
    category: str
    color: str
    icon: str
    start_date: date
    target_days: Optional[int]
    is_active: bool
    created_at: datetime
    streak: Optional[int] = 0
    today_completed: Optional[bool] = False

    class Config:
        from_attributes = True


# ─── Checkin Schemas ──────────────────────────────────────────────────────────

class CheckinCreate(BaseModel):
    date: date
    completed: bool = True
    notes: Optional[str] = None


class CheckinResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: bool
    notes: Optional[str]
    mood_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class HabitMinResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str

    class Config:
        from_attributes = True


class CheckinNoteResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: bool
    notes: str
    mood_score: Optional[float]
    created_at: datetime
    habit: HabitMinResponse

    class Config:
        from_attributes = True


# ─── Analytics Schemas ────────────────────────────────────────────────────────

class HabitAnalytics(BaseModel):
    habit_id: int
    habit_name: str
    current_streak: int
    longest_streak: int
    total_checkins: int
    success_rate: float
    best_day: Optional[str]
    checkin_dates: List[str]  # ISO dates for heatmap


class OverviewAnalytics(BaseModel):
    total_habits: int
    active_habits: int
    total_checkins: int
    overall_success_rate: float
    best_streak: int
    today_completed: int
    category_breakdown: dict
    weekly_checkins: List[dict]  # last 7 days


# ─── Badge Schemas ────────────────────────────────────────────────────────────

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    xp_reward: int
    criteria_type: str
    criteria_value: int
    rarity: str
    earned: bool = False
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    total_xp: int
    level: int
    xp_to_next_level: int
    total_checkins: int
    longest_streak_ever: int
    badges_earned: int


# ─── AI Schemas ───────────────────────────────────────────────────────────────

class HabitSuggestion(BaseModel):
    name: str
    category: str
    icon: str
    reason: str
    difficulty: str  # easy, medium, hard


class MoodTrend(BaseModel):
    period: str
    average_mood: float
    trend: str  # improving, stable, declining
    dominant_emotion: str
    data_points: List[dict]


class QuoteResponse(BaseModel):
    quote: str
    author: str
    category: str
