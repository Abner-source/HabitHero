import { useState, useEffect } from "react";
import { Trash2, Edit3, Calendar, Sparkles, Smile, Frown, Meh, Plus } from "lucide-react";
import TopBar from "../components/Layout/TopBar";
import { getHabits, createCheckin, deleteCheckin, getNotes, getSuggestions } from "../api/client";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function NotesPage() {
  const [habits, setHabits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [noteDate, setNoteDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  async function loadData() {
    try {
      const [h, n, s] = await Promise.all([getHabits(), getNotes(), getSuggestions()]);
      setHabits(h);
      setNotes(n);
      setSuggestions(s);
      if (h.length > 0 && !selectedHabitId) {
        setSelectedHabitId(h[0].id.toString());
      }
    } catch (e) {
      console.error("Error loading notes data:", e);
      toast.error(`Failed to load notes data: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Automatically update the selected habit when habits changes
  useEffect(() => {
    if (habits.length > 0) {
      if (!selectedHabitId || !habits.some(h => h.id.toString() === selectedHabitId)) {
        setSelectedHabitId(habits[0].id.toString());
      }
    } else {
      setSelectedHabitId("");
    }
  }, [habits]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedHabitId) {
      toast.error("Please select a habit");
      return;
    }
    if (!noteText.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    setFormLoading(true);
    try {
      await createCheckin(parseInt(selectedHabitId), {
        date: noteDate,
        completed: true,
        notes: noteText,
      });

      toast.success(editingNoteId ? "Note updated!" : "Note saved! 📝");
      setNoteText("");
      setEditingNoteId(null);
      // Reset date to today
      setNoteDate(format(new Date(), "yyyy-MM-dd"));
      loadData();
    } catch (e) {
      toast.error("Failed to save note");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit(note) {
    setEditingNoteId(note.id);
    setSelectedHabitId(note.habit_id.toString());
    setNoteDate(note.date);
    setNoteText(note.notes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(note) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteCheckin(note.habit_id, note.date);
      toast("Note deleted", { icon: "🗑️" });
      loadData();
    } catch (e) {
      toast.error("Failed to delete note");
    }
  }

  function getSentimentBadge(score) {
    if (score === null || score === undefined) {
      return (
        <span className="badge" style={{ background: "rgba(107,114,128,0.1)", color: "var(--text-muted)" }}>
          <Meh size={14} style={{ marginRight: 4 }} /> Neutral (0%)
        </span>
      );
    }
    if (score > 0.1) {
      return (
        <span className="badge" style={{ background: "rgba(5,150,105,0.1)", color: "var(--emerald)", fontWeight: 600 }}>
          <Smile size={14} style={{ marginRight: 4 }} /> Positive ({(score * 100).toFixed(0)}%)
        </span>
      );
    } else if (score < -0.1) {
      return (
        <span className="badge" style={{ background: "rgba(225,29,72,0.1)", color: "var(--rose)", fontWeight: 600 }}>
          <Frown size={14} style={{ marginRight: 4 }} /> Stressed ({(score * 100).toFixed(0)}%)
        </span>
      );
    } else {
      return (
        <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)", fontWeight: 600 }}>
          <Meh size={14} style={{ marginRight: 4 }} /> Neutral ({(score * 100).toFixed(0)}%)
        </span>
      );
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading your journal...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <TopBar title="Notes & Journal" subtitle="Capture your thoughts and reflect on your habit journey" />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Side: Create / Edit Form + Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Note Input Card */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div className="section-title">
                {editingNoteId ? "✏️ Edit Journal Entry" : "📝 Write a New Entry"}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Select Habit
                  </label>
                  <select
                    className="form-input"
                    value={selectedHabitId}
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                    disabled={formLoading}
                  >
                    {habits.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.icon} {h.name}
                      </option>
                    ))}
                    {habits.length === 0 && (
                      <option value="">No habits created yet</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  What's on your mind? (Sentiment is automatically analyzed)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="How did this habit go? Write down your thoughts, struggles, or successes..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{ resize: "none" }}
                  disabled={formLoading}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                {editingNoteId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingNoteId(null);
                      setNoteText("");
                      setNoteDate(format(new Date(), "yyyy-MM-dd"));
                    }}
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={formLoading || habits.length === 0}>
                  {editingNoteId ? "Update Entry" : "Save Journal Entry"}
                </button>
              </div>
            </form>
          </div>

          {/* Notes feed / History list */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div className="section-title">📅 Journal History</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{note.habit.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                          {note.habit.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} />
                          {note.date}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(note)}
                        title="Edit Note"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(note)}
                        title="Delete Note"
                        style={{ color: "var(--rose)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                    {note.notes}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>SENTIMENT:</span>
                      {getSentimentBadge(note.mood_score)}
                    </div>
                  </div>
                </div>
              ))}

              {notes.length === 0 && (
                <div className="empty-state" style={{ padding: "40px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📖</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Your journal is empty</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Start typing your habit reflections above to see sentiment analysis!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: AI Suggestions Side-Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>
          <div className="card" style={{ border: "1px solid rgba(5,150,105,0.2)", background: "rgba(5,150,105,0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color="var(--emerald)" />
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Sentiment Recommendations</span>
            </div>
            
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
              These habits are tailored automatically based on the sentiment scores of your recent journal entries.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {suggestions.slice(0, 4).map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {s.name}
                      <span
                        className="badge"
                        style={{
                          fontSize: 9,
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: s.difficulty === "easy" ? "rgba(5,150,105,0.1)" : s.difficulty === "medium" ? "rgba(245,158,11,0.1)" : "rgba(225,29,72,0.1)",
                          color: s.difficulty === "easy" ? "var(--emerald)" : s.difficulty === "medium" ? "var(--amber)" : "var(--rose)",
                        }}
                      >
                        {s.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      {s.reason}
                    </div>
                  </div>
                </div>
              ))}

              {suggestions.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px 0", fontSize: 12 }}>
                  Create habits and log notes to get AI suggestions!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
