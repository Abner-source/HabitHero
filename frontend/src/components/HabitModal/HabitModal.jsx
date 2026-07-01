import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";

const COLORS = [
  "#7c3aed", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e",
  "#0ea5e9", "#ec4899", "#fb923c", "#22c55e", "#818cf8",
];

const ICONS = [
  "⭐", "🔥", "💪", "🧘", "📚", "🏃", "💧", "🥗", "🎯", "🧠",
  "💤", "🎨", "🎵", "📖", "✍️", "🚶", "🏋️", "🧪", "💼", "💰",
];

const CATEGORIES = [
  "health", "fitness", "work", "learning", "mental_health",
  "productivity", "social", "finance", "creativity", "other",
];

const DEFAULTS = {
  name: "",
  description: "",
  frequency: "daily",
  category: "health",
  color: "#7c3aed",
  icon: "⭐",
  start_date: format(new Date(), "yyyy-MM-dd"),
  target_days: null,
};

export default function HabitModal({ habit, onClose, onSave }) {
  const [form, setForm] = useState(habit ? {
    ...habit,
    start_date: habit.start_date,
  } : { ...DEFAULTS });
  const [saving, setSaving] = useState(false);

  const isEdit = !!habit;

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Habit" : "Create New Habit"}</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Habit Name *</label>
            <input
              id="habit-name"
              className="form-input"
              placeholder="e.g. Morning meditation"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="habit-desc"
              className="form-input"
              placeholder="Why is this habit important to you?"
              rows={2}
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          {/* Frequency + Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                id="habit-freq"
                className="form-select"
                value={form.frequency}
                onChange={(e) => set("frequency", e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                id="habit-category"
                className="form-select"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              id="habit-start"
              type="date"
              className="form-input"
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker-row">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${form.color === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => set("color", c)}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="icon-picker-row">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-btn ${form.icon === icon ? "selected" : ""}`}
                  onClick={() => set("icon", icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="habit-save-btn"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={saving || !form.name.trim()}
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Habit ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
