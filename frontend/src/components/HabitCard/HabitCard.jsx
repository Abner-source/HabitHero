import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, CheckCircle2, Circle, Flame } from "lucide-react";
import { createCheckin, deleteCheckin } from "../../api/client";
import CheckinModal from "../CheckinModal/CheckinModal";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
  health:       { bg: "rgba(16,185,129,0.12)",  text: "#059669" },
  fitness:      { bg: "rgba(245,158,11,0.12)",  text: "#d97706" },
  work:         { bg: "rgba(2,132,199,0.12)",   text: "#0284c7" },
  learning:     { bg: "rgba(124,58,237,0.12)",  text: "#7c3aed" },
  mental_health:{ bg: "rgba(225,29,72,0.1)",    text: "#e11d48" },
  productivity: { bg: "rgba(99,102,241,0.12)",  text: "#6366f1" },
  social:       { bg: "rgba(236,72,153,0.12)",  text: "#ec4899" },
  finance:      { bg: "rgba(34,197,94,0.12)",   text: "#16a34a" },
  creativity:   { bg: "rgba(249,115,22,0.12)",  text: "#ea6c0a" },
  other:        { bg: "rgba(107,114,128,0.12)", text: "#6b7280" },
};

export default function HabitCard({ habit, selectedDate, onEdit, onDelete, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const targetDate = selectedDate || format(new Date(), "yyyy-MM-dd");
  const isToday = targetDate === format(new Date(), "yyyy-MM-dd");
  const catStyle = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.other;

  async function handleCheckinToggle() {
    if (habit.today_completed) {
      setLoading(true);
      try {
        await deleteCheckin(habit.id, targetDate);
        toast("Check-in removed", { icon: "↩️" });
        await onRefresh();
      } catch (e) {
        toast.error("Failed to remove check-in");
      } finally {
        setLoading(false);
      }
    } else {
      setIsCheckingIn(true);
    }
  }

  async function handleCheckinSave(note) {
    setLoading(true);
    setIsCheckingIn(false);
    try {
      await createCheckin(habit.id, { date: targetDate, completed: true, notes: note || null });
      toast.success("Check-in recorded! +10 XP 🎉");
      await onRefresh();
    } catch (e) {
      console.error("Check-in error:", e);
      const msg = e?.response?.data?.detail || e?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`habit-card ${habit.today_completed ? "habit-card-completed" : ""} animate-fade-in`}>
      {/* Colored top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 4,
          background: habit.color,
          borderRadius: "16px 16px 0 0",
        }}
      />

      <div className="habit-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="habit-card-icon-wrapper"
            style={{ background: `${habit.color}18`, border: `1.5px solid ${habit.color}40` }}
          >
            <span style={{ fontSize: 22 }}>{habit.icon}</span>
          </div>
          <div>
            <div className="habit-card-name">{habit.name}</div>
            <div className="habit-card-meta">
              <span
                className="habit-category-badge"
                style={{ background: catStyle.bg, color: catStyle.text }}
              >
                {habit.category.replace("_", " ")}
              </span>
              <span>•</span>
              <span>{habit.frequency}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
            title="Edit habit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn btn-danger btn-icon"
            onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
            title="Delete habit"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {habit.description && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          {habit.description}
        </p>
      )}

      <div className="habit-card-streak">
        <Flame size={16} color={habit.streak > 0 ? "#d97706" : "#d1d5db"} />
        <span className="streak-value" style={{ color: habit.streak > 0 ? "#d97706" : "var(--text-muted)" }}>
          {habit.streak}
        </span>
        <span className="streak-label">day streak</span>

        {habit.streak >= 7 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              background: "rgba(217,119,6,0.1)",
              color: "#d97706",
              padding: "2px 8px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            🔥 On fire!
          </span>
        )}
      </div>

      <button
        className={`checkin-btn ${habit.today_completed ? "checkin-btn-done" : "checkin-btn-pending"}`}
        onClick={handleCheckinToggle}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <span style={{ opacity: 0.7 }}>Saving...</span>
        ) : habit.today_completed ? (
          <>
            <CheckCircle2 size={15} />
            {isToday ? "Completed Today ✓" : "Completed on this Day ✓"}
          </>
        ) : (
          <>
            <Circle size={15} />
            Mark as Done
          </>
        )}
      </button>

      {isCheckingIn && (
        <CheckinModal
          habit={habit}
          onClose={() => setIsCheckingIn(false)}
          onSave={handleCheckinSave}
        />
      )}
    </div>
  );
}
