import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, BookOpen, BarChart2, Trophy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserStats } from "../../api/client";

const NAV_ITEMS = [
  { to: "/", icon: <LayoutDashboard />, label: "Dashboard" },
  { to: "/habits", icon: <ListChecks />, label: "Habits" },
  { to: "/notes", icon: <BookOpen />, label: "Notes" },
  { to: "/analytics", icon: <BarChart2 />, label: "Analytics" },
  { to: "/badges", icon: <Trophy />, label: "Badges" },
  { to: "/ai", icon: <Sparkles />, label: "AI Insights" },
];

export default function Sidebar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getUserStats().then(setStats).catch(() => {});
  }, []);

  const xpProgress = stats
    ? Math.min(100, ((stats.total_xp - getXpThreshold(stats.level)) /
        Math.max(1, getXpThreshold(stats.level + 1) - getXpThreshold(stats.level))) * 100)
    : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏆</div>
        <span className="sidebar-logo-text">HabitHero</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {stats && (
          <div className="xp-card">
            <div className="xp-card-header">
              <span className="xp-label">⚡ Level {stats.level}</span>
              <span className="xp-value">{stats.total_xp.toLocaleString()} XP</span>
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="xp-level">{stats.xp_to_next_level} XP to next level</div>
          </div>
        )}
        <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "0 4px" }}>
          Keep the streak alive! 🔥
        </div>
      </div>
    </aside>
  );
}

function getXpThreshold(level) {
  const thresholds = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000];
  return thresholds[Math.min(level - 1, thresholds.length - 1)] ?? 0;
}
