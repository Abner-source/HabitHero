import { useState, useEffect } from "react";
import TopBar from "../components/Layout/TopBar";
import BadgeCard from "../components/Badges/BadgeCard";
import { getBadges, getUserStats } from "../api/client";
import { Trophy, Star, Zap, Target } from "lucide-react";
import toast from "react-hot-toast";

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBadges(), getUserStats()])
      .then(([b, s]) => { setBadges(b); setStats(s); })
      .catch(() => toast.error("Failed to load badges"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = badges
    .filter((b) => filter === "all" || (filter === "earned" ? b.earned : !b.earned))
    .sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return (RARITY_ORDER[a.rarity] ?? 3) - (RARITY_ORDER[b.rarity] ?? 3);
    });

  const earnedCount = badges.filter((b) => b.earned).length;
  const levelInfo = stats ? getLevelInfo(stats.level, stats.total_xp) : null;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading your achievements...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TopBar title="Badges & XP" subtitle={`${earnedCount} of ${badges.length} badges earned`} />

      {/* Level Card */}
      {stats && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.07), rgba(5,150,105,0.04))",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 20,
            padding: 28,
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 28,
            flexWrap: "wrap",
            boxShadow: "0 2px 12px rgba(249,115,22,0.08)",
          }}
        >
          {/* Level badge */}
          <div
            style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--orange-dark), var(--orange-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{stats.level}</span>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              Level {stats.level} Hero
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
              {stats.total_xp.toLocaleString()} XP total • {stats.xp_to_next_level} XP to next level
            </div>
            <div className="xp-bar-track" style={{ height: 10 }}>
              <div className="xp-bar-fill" style={{ width: `${levelInfo?.pct ?? 0}%`, height: "100%" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total XP", value: stats.total_xp.toLocaleString(), icon: <Zap size={16} color="#d97706" /> },
              { label: "Check-ins", value: stats.total_checkins, icon: <Target size={16} color="#059669" /> },
              { label: "Best Streak", value: `${stats.longest_streak_ever}d`, icon: <Star size={16} color="#f97316" /> },
              { label: "Badges", value: `${stats.badges_earned}`, icon: <Trophy size={16} color="#d97706" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginBottom: 4 }}>
                  {icon}
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{value}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-tabs">
        {[
          { id: "all", label: `All (${badges.length})` },
          { id: "earned", label: `✅ Earned (${earnedCount})` },
          { id: "locked", label: `🔒 Locked (${badges.length - earnedCount})` },
        ].map(({ id, label }) => (
          <button key={id} className={`filter-tab ${filter === id ? "active" : ""}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="badges-grid">
        {filtered.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">{filter === "earned" ? "No badges earned yet" : "No locked badges"}</div>
          <div className="empty-state-desc">Keep checking in to earn your first badge!</div>
        </div>
      )}
    </div>
  );
}

function getLevelInfo(level, totalXp) {
  const thresholds = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000];
  const current = thresholds[Math.min(level - 1, thresholds.length - 1)] ?? 0;
  const next = thresholds[Math.min(level, thresholds.length - 1)] ?? 100000;
  const range = Math.max(1, next - current);
  const pct = Math.min(100, Math.round(((totalXp - current) / range) * 100));
  return { pct };
}
