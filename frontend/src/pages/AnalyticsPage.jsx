import { useState, useEffect } from "react";
import TopBar from "../components/Layout/TopBar";
import { getOverview, getHabits, getHabitAnalytics } from "../api/client";
import { WeeklyBarChart, CategoryPieChart } from "../components/Analytics/Charts";
import CalendarHeatmap from "../components/CalendarHeatmap/CalendarHeatmap";
import { Flame, CheckCircle2, TrendingUp, Calendar, Download } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitAnalytics, setHabitAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview(), getHabits()])
      .then(([ov, h]) => {
        setOverview(ov);
        setHabits(h);
        if (h.length > 0) loadHabitAnalytics(h[0].id);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  async function loadHabitAnalytics(id) {
    setSelectedHabit(id);
    try {
      const a = await getHabitAnalytics(id);
      setHabitAnalytics(a);
    } catch {
      toast.error("Failed to load habit analytics");
    }
  }

  const downloadPDFSummary = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors
      const primaryColor = [30, 41, 59]; // slate-800
      const accentColor = [124, 58, 237]; // violet-600
      const textColor = [51, 65, 85]; // slate-700
      const lightBg = [248, 250, 252]; // slate-50

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Helper: Draw horizontal line
      const drawLine = (yPos) => {
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
      };

      // Header: App Logo / Title
      doc.setFillColor(...accentColor);
      doc.rect(margin, y, 6, 6, "F"); // logo block

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text("HabitHero", margin + 10, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      const dateStr = new Date().toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      doc.text(`Generated on ${dateStr}`, pageWidth - margin, y + 5, { align: "right" });

      y += 12;
      drawLine(y);
      y += 12;

      // Section 1: Overview Summary Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("Overall Analytics Summary", margin, y);
      y += 8;

      // Stats cards background grid
      const colWidth = (pageWidth - 2 * margin - 6) / 4;
      
      const stats = [
        { label: "Best Streak", value: `${overview?.best_streak ?? 0} days` },
        { label: "Total Check-ins", value: `${overview?.total_checkins ?? 0}` },
        { label: "Success Rate", value: `${overview?.overall_success_rate ?? 0}%` },
        { label: "Completed Today", value: `${overview?.today_completed ?? 0}` }
      ];

      stats.forEach((stat, i) => {
        const x = margin + i * (colWidth + 2);
        // Draw card background
        doc.setFillColor(...lightBg);
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(x, y, colWidth, 22, 2, 2, "FD");

        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...accentColor);
        doc.text(stat.value, x + colWidth / 2, y + 10, { align: "center" });

        // Label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        doc.text(stat.label, x + colWidth / 2, y + 16, { align: "center" });
      });

      y += 32;
      drawLine(y);
      y += 12;

      // Section 2: Category Breakdown
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("Category Breakdown", margin, y);
      y += 8;

      const categories = Object.entries(overview?.category_breakdown ?? {});
      if (categories.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...textColor);

        categories.forEach(([cat, val]) => {
          const catName = cat.replace("_", " ").toUpperCase();
          doc.setFont("helvetica", "bold");
          doc.text(catName, margin, y);
          doc.setFont("helvetica", "normal");
          
          // Draw progress bar
          const barWidth = 80;
          const valWidth = (val / 100) * barWidth;
          
          // Background bar
          doc.setFillColor(241, 245, 249);
          doc.rect(margin + 40, y - 3, barWidth, 4, "F");
          // Active bar
          doc.setFillColor(...accentColor);
          doc.rect(margin + 40, y - 3, valWidth, 4, "F");

          doc.text(`${val}%`, margin + 40 + barWidth + 6, y);
          y += 8;
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("No category data logged yet.", margin, y);
        y += 8;
      }

      y += 12;
      drawLine(y);
      y += 12;

      // Section 3: Habit Summary List
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("Active Habits Tracked", margin, y);
      y += 10;

      if (habits.length > 0) {
        // Table Header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text("Habit Name", margin + 4, y);
        doc.text("Category", margin + 70, y);
        doc.text("Frequency", margin + 110, y);
        doc.text("Current Streak", margin + 140, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...textColor);

        habits.forEach((h, idx) => {
          // Zebra striping
          if (idx % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 7, "F");
          }

          doc.setFont("helvetica", "bold");
          doc.text(h.name, margin + 4, y);
          
          doc.setFont("helvetica", "normal");
          doc.text(h.category.replace("_", " "), margin + 70, y);
          doc.text(h.frequency, margin + 110, y);
          doc.text(`${h.streak ?? 0} days`, margin + 140, y);
          y += 7;

          // Check page break if habits list is very long
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("No active habits created yet.", margin, y);
      }

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("HabitHero - Build Better Routines Every Day", pageWidth / 2, 287, { align: "center" });

      doc.save("habithero-analytics-summary.pdf");
      toast.success("PDF summary downloaded! 📄");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF summary");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Crunching the numbers...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Analytics"
        subtitle="Track your progress over time"
        action={
          <button
            onClick={downloadPDFSummary}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Download size={15} />
            Download PDF Summary
          </button>
        }
      />

      {/* Overview Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(217,119,6,0.1)" }}>
            <Flame size={20} color="#d97706" />
          </div>
          <div className="stat-value">{overview?.best_streak ?? 0}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(5,150,105,0.1)" }}>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div className="stat-value">{overview?.total_checkins ?? 0}</div>
          <div className="stat-label">Total Check-ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(2,132,199,0.1)" }}>
            <TrendingUp size={20} color="#0284c7" />
          </div>
          <div className="stat-value">{overview?.overall_success_rate ?? 0}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(249,115,22,0.1)" }}>
            <Calendar size={20} color="#f97316" />
          </div>
          <div className="stat-value">{overview?.today_completed ?? 0}</div>
          <div className="stat-label">Completed Today</div>
        </div>
      </div>

      {/* Row 1: Weekly + Category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">📊 Weekly Check-ins</div>
          </div>
          <WeeklyBarChart data={overview?.weekly_checkins ?? []} />
        </div>
        <div className="card">
          <div className="section-header">
            <div className="section-title">🗂️ Category Breakdown</div>
          </div>
          <CategoryPieChart data={overview?.category_breakdown ?? {}} />
        </div>
      </div>

      {/* Per-Habit Deep-Dive */}
      {habits.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-header">
            <div className="section-title">🔍 Habit Deep-Dive</div>
          </div>

          <div className="filter-tabs" style={{ marginBottom: 20 }}>
            {habits.map((h) => (
              <button
                key={h.id}
                className={`filter-tab ${selectedHabit === h.id ? "active" : ""}`}
                onClick={() => loadHabitAnalytics(h.id)}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </div>

          {habitAnalytics && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Current Streak", value: habitAnalytics.current_streak, suffix: " days", color: "#d97706" },
                  { label: "Longest Streak", value: habitAnalytics.longest_streak, suffix: " days", color: "#f97316" },
                  { label: "Total Check-ins", value: habitAnalytics.total_checkins, suffix: "", color: "#059669" },
                  { label: "Success Rate", value: `${habitAnalytics.success_rate}%`, suffix: "", color: "#0284c7" },
                ].map(({ label, value, suffix, color }) => (
                  <div key={label} className="card-sm" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}{suffix}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
                    {label === "Success Rate" && (
                      <div style={{ marginTop: 8, height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${habitAnalytics.success_rate}%`, background: "#0284c7", borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {habitAnalytics.best_day && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  🏆 Best day: <strong style={{ color: "#d97706" }}>{habitAnalytics.best_day}</strong>
                </div>
              )}

              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                📅 Check-in History (last 26 weeks)
              </div>
              <CalendarHeatmap checkinDates={habitAnalytics.checkin_dates} />
            </>
          )}
        </div>
      )}

      {habits.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No data yet</div>
          <div className="empty-state-desc">Create habits and start checking in to see analytics!</div>
        </div>
      )}
    </div>
  );
}
