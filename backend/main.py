from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import engine, SessionLocal
from models import Base
from services.badge_service import seed_badges
from routers import habits, checkins, analytics, badges, ai

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed badges on startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_badges(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="HabitHero API",
    description="Backend for the HabitHero habit tracking app",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React dev server
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(checkins.router)
app.include_router(habits.router)
app.include_router(analytics.router)
app.include_router(badges.router)
app.include_router(ai.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HabitHero API"}
