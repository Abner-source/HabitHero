import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ─── Habits ──────────────────────────────────────────────────────────────────
export const getHabits = (date) => client.get("/habits", { params: { target_date: date } }).then((r) => r.data);
export const createHabit = (data) => client.post("/habits", data).then((r) => r.data);
export const updateHabit = (id, data) => client.put(`/habits/${id}`, data).then((r) => r.data);
export const deleteHabit = (id) => client.delete(`/habits/${id}`);
export const getHabit = (id) => client.get(`/habits/${id}`).then((r) => r.data);

// ─── Check-ins ────────────────────────────────────────────────────────────────
export const createCheckin = (habitId, data) =>
  client.post(`/habits/${habitId}/checkin`, data).then((r) => r.data);
export const getCheckins = (habitId) =>
  client.get(`/habits/${habitId}/checkins`).then((r) => r.data);
export const deleteCheckin = (habitId, date) =>
  client.delete(`/habits/${habitId}/checkin/${date}`);
export const getNotes = () => client.get("/habits/notes").then((r) => r.data);

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getHabitAnalytics = (id) =>
  client.get(`/analytics/habits/${id}`).then((r) => r.data);
export const getOverview = () => client.get("/analytics/overview").then((r) => r.data);

// ─── Badges ───────────────────────────────────────────────────────────────────
export const getBadges = () => client.get("/badges").then((r) => r.data);
export const getUserStats = () => client.get("/badges/stats").then((r) => r.data);

// ─── AI ───────────────────────────────────────────────────────────────────────
export const getQuote = () => client.get("/ai/quote").then((r) => r.data);
export const getSuggestions = () => client.get("/ai/suggestions").then((r) => r.data);
export const getMoodTrend = () => client.get("/ai/mood-trend").then((r) => r.data);

export default client;
