import { useEffect, useState } from "react";
import { Flame, CheckCircle2, Target, TrendingUp, Plus } from "lucide-react";
import TopBar from "../components/Layout/TopBar";
import { getOverview, getQuote, getHabits, createCheckin } from "../api/client";
import { WeeklyBarChart } from "../components/Analytics/Charts";
import CheckinModal from "../components/CheckinModal/CheckinModal";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [quote, setQuote] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingInHabit, setCheckingInHabit] = useState(null);
  const today = format(new Date(), "yyyy-MM-dd");

  async function load() {
    try {
      const [ov, q, h] = await Promise.all([getOverview(), getQuote(), getHabits()]);
      setOverview(ov);
      setQuote(q);
      setHabits(h);
    } catch {
      toast.error("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleQuickCheckin(habit) {
    setCheckingInHabit(habit);
  }

  async function saveQuickCheckin(note) {
    if (!checkingInHabit) return;
    try {
      await createCheckin(checkingInHabit.id, { date: today, completed: true, notes: note || null });
      toast.success(`✅ ${checkingInHabit.name} done! +10 XP`);
      load();
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to check in";
      toast.error(msg);
    } finally {
      setCheckingInHabit(null);
    }
  }

  const todayHabits = habits.filter((h) => h.frequency === "daily");
  const completedCount = todayHabits.filter((h) => h.today_completed).length;
  const progress = todayHabits.length > 0 ? Math.round((completedCount / todayHabits.length) * 100) : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading your journey...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Dashboard"
        subtitle={progress === 100 && todayHabits.length > 0 ? "All habits done! Amazing work today 🎉" : `${completedCount}/${todayHabits.length} habits done today`}
      />

      {/* Quote Banner */}
      {quote && (
        <div className="quote-banner">
          <p className="quote-text">"{quote.quote}"</p>
          <p className="quote-author">— {quote.author}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(217,119,6,0.1)" }}>
            <Flame size={20} color="#d97706" />
          </div>
          <div className="stat-value">{overview?.best_streak ?? 0}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(5,150,105,0.1)" }}>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div className="stat-value">{overview?.total_checkins ?? 0}</div>
          <div className="stat-label">Total Check-ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(249,115,22,0.1)" }}>
            <Target size={20} color="#f97316" />
          </div>
          <div className="stat-value">{overview?.total_habits ?? 0}</div>
          <div className="stat-label">Active Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(2,132,199,0.1)" }}>
            <TrendingUp size={20} color="#0284c7" />
          </div>
          <div className="stat-value">{overview?.overall_success_rate ?? 0}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Today's Habits */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">📋 Today's Habits</div>
              <div className="section-subtitle">{format(new Date(), "EEEE, MMMM d")}</div>
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: progress === 100 ? "var(--emerald)" : "var(--orange)",
            }}>
              {progress}%
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-label">{completedCount} of {todayHabits.length} completed</div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {todayHabits.slice(0, 6).map((h) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: h.today_completed ? "rgba(5,150,105,0.06)" : "var(--bg-secondary)",
                  border: `1px solid ${h.today_completed ? "rgba(5,150,105,0.2)" : "var(--border)"}`,
                  cursor: h.today_completed ? "default" : "pointer",
                  transition: "var(--transition)",
                }}
                onClick={() => !h.today_completed && handleQuickCheckin(h)}
              >
                <span style={{ fontSize: 18 }}>{h.icon}</span>
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: h.today_completed ? "var(--emerald)" : "var(--text-primary)",
                  textDecoration: h.today_completed ? "line-through" : "none",
                  opacity: h.today_completed ? 0.75 : 1,
                }}>
                  {h.name}
                </span>
                {h.today_completed ? (
                  <CheckCircle2 size={16} color="var(--emerald)" />
                ) : (
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #d1d5db" }} />
                )}
              </div>
            ))}

            {todayHabits.length === 0 && (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  No habits yet. Create your first one!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">📊 This Week</div>
              <div className="section-subtitle">Daily check-ins trend</div>
            </div>
          </div>
          <WeeklyBarChart data={overview?.weekly_checkins ?? []} />
        </div>
      </div>

      {checkingInHabit && (
        <CheckinModal
          habit={checkingInHabit}
          onClose={() => setCheckingInHabit(null)}
          onSave={saveQuickCheckin}
        />
      )}
    </div>
  );
}
