# 🏆 HabitHero

A premium full-stack habit tracker with gamification, analytics, and AI-powered insights.

**Tech Stack**: React + Vite · FastAPI · SQLite 

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env

# Start the server
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**
Swagger UI at **http://localhost:8000/docs**

The SQLite database (`habithero.db`) is created automatically on first run, along with all 10 default badges.

---

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 📁 Project Structure

```
HabitHero/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # DB engine & session
│   ├── routers/
│   │   ├── habits.py        # CRUD for habits
│   │   ├── checkins.py      # Check-in endpoints
│   │   ├── analytics.py     # Streaks, success rate, overview
│   │   ├── badges.py        # Badges & XP stats
│   │   └── ai.py            # Quotes, suggestions, mood
│   └── services/
│       ├── streak_service.py
│       ├── badge_service.py
│       └── ai_service.py
└── frontend/
    └── src/
        ├── pages/            # Dashboard, Habits, Analytics, Badges, AI
        ├── components/       # HabitCard, Modal, Charts, Heatmap...
        └── api/client.js     # Axios API client
```

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Habit Management** | Create/edit/delete with name, icon, color, frequency, category |
| **Check-ins** | Daily check-ins with optional mood notes |
| **Streaks** | Current & longest streak per habit |
| **Analytics** | Weekly bar chart, category pie, GitHub-style heatmap |
| **AI Suggestions** | Rule-based habit suggestions by category gap analysis |
| **Mood Analysis** | Keyword sentiment from check-in notes |
| **Gamification** | XP points (+10/check-in), levels, 10 unlockable badges |
| **Daily Quote** | Rotating motivational quotes |

---

### ⚠️ SQLite Persistence Note
The application uses a local SQLite database (`habithero.db`) by default. If deploying to stateless or ephemeral hosting platforms (like Render's Free Tier or Heroku), the database file will reset on every server restart or spin-down. For persistent cloud deployments, attach a persistent volume (disk) or connect to a cloud database (like PostgreSQL).
