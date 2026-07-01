import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import HabitsPage from "./pages/HabitsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BadgesPage from "./pages/BadgesPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import NotesPage from "./pages/NotesPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/ai" element={<AIInsightsPage />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          },
          success: {
            iconTheme: { primary: "#059669", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#e11d48", secondary: "#ffffff" },
          },
        }}
      />
    </BrowserRouter>
  );
}
