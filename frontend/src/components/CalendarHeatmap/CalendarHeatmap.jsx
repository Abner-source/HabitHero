import { useMemo } from "react";
import { eachDayOfInterval, format, subDays, startOfWeek } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CalendarHeatmap({ checkinDates = [], weeks = 26 }) {
  const dateSet = useMemo(() => new Set(checkinDates), [checkinDates]);

  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, weeks * 7 - 1);
    return eachDayOfInterval({ start, end });
  }, [weeks]);

  // Group by week (columns)
  const columns = useMemo(() => {
    const cols = [];
    let col = [];
    for (let i = 0; i < days.length; i++) {
      col.push(days[i]);
      if (col.length === 7 || i === days.length - 1) {
        cols.push(col);
        col = [];
      }
    }
    return cols;
  }, [days]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    columns.forEach((col, ci) => {
      const m = col[0].getMonth();
      if (m !== lastMonth) {
        labels.push({ col: ci, label: MONTHS[m] });
        lastMonth = m;
      }
    });
    return labels;
  }, [columns]);

  return (
    <div className="heatmap-container">
      {/* Month labels */}
      <div style={{ display: "flex", paddingLeft: 28, marginBottom: 4, position: "relative" }}>
        {monthLabels.map(({ col, label }) => (
          <div
            key={`${col}-${label}`}
            style={{
              position: "absolute",
              left: 28 + col * 17,
              fontSize: 10,
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 6, marginTop: 16 }}>
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                height: 14,
                fontSize: 9,
                color: "var(--text-muted)",
                lineHeight: "14px",
                opacity: i % 2 === 0 ? 1 : 0,
                userSelect: "none",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "flex", gap: 3, marginTop: 16 }}>
          {columns.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {Array.from({ length: 7 }).map((_, di) => {
                const day = col[di];
                if (!day) return <div key={di} style={{ width: 14, height: 14 }} />;
                const iso = format(day, "yyyy-MM-dd");
                const completed = dateSet.has(iso);
                return (
                  <div
                    key={di}
                    className={`heatmap-cell ${completed ? "level-4" : ""}`}
                    title={`${format(day, "MMM d, yyyy")}${completed ? " ✓" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`heatmap-cell ${l > 0 ? `level-${l}` : ""}`} style={{ flexShrink: 0 }} />
        ))}
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>More</span>
      </div>
    </div>
  );
}
