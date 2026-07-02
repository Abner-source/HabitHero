# 🏆 HabitHero — Full Stack Habit Tracker Documentation

HabitHero is a premium, full-stack habit tracking web application designed to help users establish and maintain daily routines. The application incorporates a clean visual aesthetic, gamified XP progression, interactive weekly and category analytics, automatic negation-aware AI sentiment analysis of check-in diaries, and custom PDF report compilation.

---

## 🏛️ Detailed System Architecture & Python/FastAPI Implementation

HabitHero is split into a decoupled frontend and backend service architecture, enabling independent deployment and clean separation of concerns.

```mermaid
graph TD
    A[Vercel Frontend: React + Vite] -->|HTTPS Requests| B[Render Backend: FastAPI]
    B -->|SQLAlchemy ORM| C[(SQLite Database: local/prod)]
    B -->|AI Sentiment Logic| D[Mood Tracker]
    A -->|jsPDF Compilation| E[Client-Side PDF Summary]
```

### 1. Backend: Python & FastAPI Framework
The backend of HabitHero is engineered using **Python 3.11** and **FastAPI**, choosing FastAPI for its high performance, automatic OpenAPI documentation, and asynchronous capabilities.

* **Asynchronous Lifespan Management (`lifespan`)**: The application uses Python's `asynccontextmanager` to control startup and shutdown operations in `main.py`. Upon server start, the lifespan hook triggers SQLAlchemy's `create_all` to automatically construct database tables and runs `seed_badges` to populate default badges if the database is uninitialized.
* **Dependency Injection (`Depends`)**: Database connections are managed safely using FastAPI's dependency injection system. The `get_db` generator yield-pattern yields a SQLAlchemy session and guarantees it is closed under a `finally` block once the request has completed, preventing database connection pool exhaustion.
* **Modular Router Architecture (`APIRouter`)**: The API is cleanly partitioned into modular routers registered under prefix namespaces:
  - `/habits`: Habit registration, filters, and target-date listings.
  - `/checkins`: Toggling check-ins, tracking history, and diary notes.
  - `/analytics`: Aggregations of streaks, success rates, and category statistics.
  - `/badges`: Gamified reward logic and status.
  - `/ai`: Sentiment analysis, motivational quotes, and habit recommendation engines.
* **Security & CORS Middleware**: Security headers and cross-origin permissions are configured via FastAPI's `CORSMiddleware`, parsing origins dynamically from environment variables to allow seamless communication between the deployed React frontend and Python backend.
* **Pydantic Validation & Serialization (v2)**: Pydantic schemas (inheriting from `BaseModel`) validate incoming JSON request payloads against specific types and regex patterns (e.g. validating HEX color codes). The schema handles serialization from SQLAlchemy model instances using `from_attributes = True`, ensuring clean response data validation.
* **SQLAlchemy ORM & SQLite Engine**: SQLite is utilized as the database backend. SQLAlchemy handles model mappings. The database engine is configured with `check_same_thread=False` to handle FastAPI's concurrent request workers safely.

### 2. Frontend (React + Vite)
- **Vite**: Ultra-fast build tool for modern React applications.
- **Recharts**: Declarative charts for rendering the weekly check-in bar charts and category pie charts.
- **Lucide React**: Clean vector icon pack.
- **jsPDF**: Client-side PDF generation engine.
- **Axios**: Promised-based HTTP client for consuming API endpoints.
- **CSS3 (Vanilla)**: Structured glassmorphic stylesheet with HSL colors, responsive design layouts, and micro-animations.

---

## 🗃️ Database Schema

The database consists of 5 core tables. Relationships are managed dynamically via SQLAlchemy.

```mermaid
erDiagram
    HABIT {
        int id PK
        string name
        text description
        string frequency
        string category
        string color
        string icon
        date start_date
        int target_days
        boolean is_active
        datetime created_at
    }
    CHECKIN {
        int id PK
        int habit_id FK
        date date
        boolean completed
        text notes
        float mood_score
        datetime created_at
    }
    BADGE {
        int id PK
        string name
        text description
        string icon
        int xp_reward
        string criteria_type
        int criteria_value
        string rarity
    }
    USER_BADGE {
        int id PK
        int badge_id FK
        int habit_id FK
        datetime earned_at
    }
    USER_STATS {
        int id PK
        int total_xp
        int total_checkins
        int longest_streak_ever
    }
    HABIT ||--o{ CHECKIN : "has"
    BADGE ||--o{ USER_BADGE : "awarded"
    HABIT ||--o{ USER_BADGE : "triggers"
```

---

## 💡 Feature Implementation Deep Dive

### 1. Negation-Aware Sentiment Engine
The mood analysis engine in `ai_service.py` processes daily check-in notes to determine emotional sentiment on a scale from `-1.0` (Highly Negative) to `+1.0` (Highly Positive).

Unlike simple keyword matching, this engine is **negation-aware**. It scans word tokens in chronological order and checks if a negation word (e.g., *not, never, don't, wasn't, lack, no*) appears within **two words** prior to an emotional keyword. If found, the sentiment value of the keyword is inverted.

* **Example 1**: `"I had a bad day"` → Keyword `bad` (-0.6) → Score: `-0.6`
* **Example 2**: `"Today was not bad"` → Negation `not` + Keyword `bad` (-0.6) → Inverted Score: `+0.6` (Positive)

### 2. Date-Specific Check-ins (Historical Calendar)
The app supports historical tracking. The `getHabits` API call takes an optional `target_date` parameter (defaulting to today). 
* When a user changes the calendar date selector on the **My Habits** page, it queries the backend for the completion status on that specific date.
* When a check-in is toggled, it records or deletes the `Checkin` record for the targeted date.

### 3. Analytics PDF Summary Compiler
Using `jsPDF`, the **Download PDF Summary** button in `AnalyticsPage.jsx` triggers a client-side vector render. Emojis are stripped to prevent PDF font crashes, and the system draws:
* A header with overall stats (total habits, success rates, active streaks).
* A **Category Breakdown** layout including horizontal progress bars calculated as a percentage of total habits.
* An **Active Habits Table** showing habit names, categories, tracking frequency, and streaks.

### 4. Gamification Level Calculation
XP thresholds progress geometrically. The level calculation formula behaves as follows:
* **Thresholds**: Level 1 (0 XP) · Level 2 (500 XP) · Level 3 (1500 XP) · Level 4 (3500 XP) · Level 5 (7500 XP)
* Check-ins reward `+10 XP`. Badges reward up to `+750 XP`.

---

## 🔌 API Endpoints Reference

### Habits
* `GET /habits?target_date=YYYY-MM-DD` — List active habits with completion status on the target date.
* `POST /habits` — Create a new habit.
* `GET /habits/{id}` — Fetch details for a specific habit.
* `PUT /habits/{id}` — Update a habit's configurations.
* `DELETE /habits/{id}` — Archive/delete a habit.

### Check-ins
* `POST /habits/{id}/checkin` — Record a check-in (with optional diary `notes`).
* `DELETE /habits/{id}/checkin/{date}` — Remove a check-in for a specific date.
* `GET /habits/notes` — Get a feed of all check-ins that contain text diaries.

### Analytics
* `GET /analytics/overview` — Fetch aggregated analytics overview (success rates, category stats, weekly check-in trends).
* `GET /analytics/habits/{id}` — Get detailed history for a single habit.

### Gamification & AI
* `GET /badges` — List all badges and whether the user has unlocked them.
* `GET /badges/stats` — Fetch level, total XP, and badge count.
* `GET /ai/quote` — Fetch a motivational quote based on recent mood.
* `GET /ai/suggestions` — Fetch habit recommendations based on category gaps.
