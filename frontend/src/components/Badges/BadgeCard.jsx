import { Lock } from "lucide-react";
import { format } from "date-fns";

const RARITY_COLORS = {
  common:    { bg: "#f3f4f6",                     text: "#6b7280",  glow: "none" },
  rare:      { bg: "rgba(2,132,199,0.1)",          text: "#0284c7",  glow: "0 0 16px rgba(2,132,199,0.18)" },
  epic:      { bg: "rgba(249,115,22,0.1)",         text: "#ea6c0a",  glow: "0 0 20px rgba(249,115,22,0.22)" },
  legendary: { bg: "rgba(217,119,6,0.12)",         text: "#d97706",  glow: "0 0 24px rgba(217,119,6,0.25)" },
};

export default function BadgeCard({ badge }) {
  const rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;

  return (
    <div
      className={`badge-card ${badge.earned ? "earned" : "locked"} animate-fade-in`}
      style={badge.earned ? { boxShadow: rarity.glow } : {}}
    >
      {badge.earned && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 10,
            background: "var(--emerald-dim)",
            color: "var(--emerald)",
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          ✓ EARNED
        </div>
      )}

      <div
        className="badge-icon-wrap"
        style={badge.earned ? {
          background: rarity.bg,
          boxShadow: rarity.glow,
        } : {
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {badge.earned ? (
          <span style={{ fontSize: 32 }}>{badge.icon}</span>
        ) : (
          <Lock size={28} color="#5a4f7a" />
        )}
      </div>

      <div className="badge-name">{badge.name}</div>
      <div className="badge-desc">{badge.description}</div>

      <div
        className={`badge-rarity rarity-${badge.rarity}`}
      >
        {badge.rarity}
      </div>

      <div className="badge-xp">+{badge.xp_reward} XP</div>

      {badge.earned && badge.earned_at && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          Earned {format(new Date(badge.earned_at), "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
}
