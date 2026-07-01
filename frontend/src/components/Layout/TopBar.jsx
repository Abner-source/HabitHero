import { format } from "date-fns";
import { Bell } from "lucide-react";

export default function TopBar({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
      }}
    >
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {action}
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 12px",
          }}
        >
          {format(new Date(), "EEE, MMM d")}
        </div>
      </div>
    </div>
  );
}
