from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(String(20), nullable=False, default="daily")  # daily, weekly
    category = Column(String(50), nullable=False, default="health")
    color = Column(String(7), nullable=False, default="#7c3aed")
    icon = Column(String(10), nullable=False, default="⭐")
    start_date = Column(Date, nullable=False)
    target_days = Column(Integer, nullable=True)  # target days per week for weekly habits
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    checkins = relationship("Checkin", back_populates="habit", cascade="all, delete-orphan")


class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    mood_score = Column(Float, nullable=True)  # -1.0 to 1.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    habit = relationship("Habit", back_populates="checkins")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(10), nullable=False)
    xp_reward = Column(Integer, default=100)
    criteria_type = Column(String(50), nullable=False)  # streak, total_checkins, category_count
    criteria_value = Column(Integer, nullable=False)
    rarity = Column(String(20), default="common")  # common, rare, epic, legendary

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=True)  # which habit triggered it

    badge = relationship("Badge", back_populates="user_badges")


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, default=1)
    total_xp = Column(Integer, default=0)
    total_checkins = Column(Integer, default=0)
    longest_streak_ever = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
