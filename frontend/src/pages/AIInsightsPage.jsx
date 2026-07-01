import { useState, useEffect } from "react";
import TopBar from "../components/Layout/TopBar";
import AIPanel from "../components/AIPanel/AIPanel";
import { getQuote } from "../api/client";

export default function AIInsightsPage() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    getQuote().then(setQuote).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <TopBar title="AI Insights" subtitle="Personalized suggestions and mood analysis" />

      {/* Quote Card */}
      {quote && (
        <div className="quote-banner" style={{ marginBottom: 24 }}>
          <p className="quote-text">"{quote.quote}"</p>
          <p className="quote-author">— {quote.author}</p>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Daily motivation · {quote.category}
          </div>
        </div>
      )}

      {/* Reminder Banner */}
      <div
        style={{
          background: "rgba(5,150,105,0.07)",
          border: "1px solid rgba(5,150,105,0.18)",
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 28 }}>⏰</div>
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Daily Reminder
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            The best time to check in is <strong style={{ color: "var(--emerald)" }}>right now</strong>.
            Small consistent steps lead to massive results.
          </div>
        </div>
      </div>

      <AIPanel />
    </div>
  );
}
