import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = [
  "#f97316", "#059669", "#d97706", "#0284c7", "#e11d48",
  "#ec4899", "#7c3aed", "#16a34a", "#6366f1", "#6b7280",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: "#111827",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#4b5563" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color || "#f97316" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          name="Check-ins"
          fill="#f97316"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }) {
  const entries = Object.entries(data).map(([name, value]) => ({ name, value }));
  if (!entries.length) return (
    <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: 40, fontSize: 14 }}>
      No habits created yet
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={entries}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name.replace("_", " ")} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {entries.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MoodLineChart({ data }) {
  if (!data?.length) return (
    <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: 40, fontSize: 13 }}>
      No mood data yet — add notes to your check-ins!
    </div>
  );

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    score: d.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[-1, 1]} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          name="Mood"
          stroke="#059669"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#059669", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#059669" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
