import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { getSuggestions, getMoodTrend } from "../../api/client";
import { MoodLineChart } from "../Analytics/Charts";

export default function AIPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("suggestions");

  useEffect(() => {
    Promise.all([getSuggestions(), getMoodTrend()])
      .then(([s, m]) => { setSuggestions(s); setMood(m); })
      .finally(() => setLoading(false));
  }, []);

  const DIFFICULTY_COLORS = {
    easy: "difficulty-easy",
    medium: "difficulty-medium",
    hard: "difficulty-hard",
  };

  return (
    <div className="ai-panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="var(--emerald)" />
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>AI Insights</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ id: "suggestions", label: "💡 Suggestions" }, { id: "mood", label: "📈 Mood Trend" }].map(({ id, label }) => (
            <button
              key={id}
              className={`filter-tab ${tab === id ? "active" : ""}`}
              style={{ padding: "5px 12px", fontSize: 12 }}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : tab === "suggestions" ? (
        <div>
          {suggestions.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 24, fontSize: 14 }}>
              Create some habits first to get personalized suggestions!
            </div>
          ) : (
            suggestions.map((s, i) => (
              <div key={i} className="ai-suggestion-item">
                <span className="ai-suggestion-icon">{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="ai-suggestion-name">
                    {s.name}
                    <span className={`difficulty-badge ${DIFFICULTY_COLORS[s.difficulty] || "difficulty-easy"}`}>
                      {s.difficulty}
                    </span>
                  </div>
                  <div className="ai-suggestion-reason">{s.reason}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {mood && (
            <>
              <div style={{ display: "flex", gap: 28, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Average Mood</div>
                  <div style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: mood.average_mood > 0.1 ? "var(--emerald)" : mood.average_mood < -0.1 ? "var(--rose)" : "var(--amber)",
                  }}>
                    {mood.average_mood > 0.1 ? "😊" : mood.average_mood < -0.1 ? "😔" : "😐"}
                    {" "}{(mood.average_mood * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Trend</div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: mood.trend === "improving" ? "var(--emerald)" : mood.trend === "declining" ? "var(--rose)" : "var(--amber)",
                  }}>
                    {mood.trend === "improving" ? "📈 Improving" : mood.trend === "declining" ? "📉 Declining" : "➡️ Stable"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Feeling</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{mood.dominant_emotion}</div>
                </div>
              </div>
              <MoodLineChart data={mood.data_points} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
