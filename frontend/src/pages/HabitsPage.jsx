import { useState, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import TopBar from "../components/Layout/TopBar";
import HabitCard from "../components/HabitCard/HabitCard";
import HabitModal from "../components/HabitModal/HabitModal";
import { getHabits, createHabit, updateHabit, deleteHabit } from "../api/client";
import toast from "react-hot-toast";
import { format } from "date-fns";

const CATEGORIES = ["all", "health", "fitness", "work", "learning", "mental_health", "productivity", "social", "finance", "creativity"];

export default function HabitsPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [habits, setHabits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  async function load() {
    try {
      const data = await getHabits(selectedDate);
      setHabits(data);
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]);

  useEffect(() => {
    let f = habits;
    if (activeCategory !== "all") f = f.filter((h) => h.category === activeCategory);
    if (search) f = f.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [habits, activeCategory, search]);

  async function handleSave(form) {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, form);
        toast.success("Habit updated!");
      } else {
        await createHabit(form);
        toast.success("Habit created! 🎉");
      }
      load();
    } catch (e) {
      toast.error("Failed to save habit");
      throw e;
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this habit? Your check-in history will be lost.")) return;
    try {
      await deleteHabit(id);
      toast("Habit deleted", { icon: "🗑️" });
      load();
    } catch {
      toast.error("Failed to delete");
    }
  }

  function openCreate() { setEditingHabit(null); setModalOpen(true); }
  function openEdit(habit) { setEditingHabit(habit); setModalOpen(true); }

  return (
    <div className="animate-fade-in">
      <TopBar
        title="My Habits"
        subtitle={`${habits.length} habits tracked`}
        action={
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}>
            <Calendar size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>
        }
      />

      {/* Search + Create */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            id="habit-search"
            className="form-input"
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button id="create-habit-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          New Habit
        </button>
      </div>

      {/* Category Filters */}
      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All" : cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{search ? "🔍" : "🌱"}</div>
          <div className="empty-state-title">
            {search ? "No habits found" : "No habits yet"}
          </div>
          <div className="empty-state-desc">
            {search ? "Try a different search term" : "Start building better routines today!"}
          </div>
          {!search && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} />
              Create Your First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="habits-grid">
          {filtered.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              selectedDate={selectedDate}
              onEdit={openEdit}
              onDelete={handleDelete}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <HabitModal
          habit={editingHabit}
          onClose={() => { setModalOpen(false); setEditingHabit(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
