import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";

export default function CheckinModal({ habit, onClose, onSave }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the textarea when the modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(note);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{habit.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Checking in: {habit.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Add an optional note to track your mood
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <textarea
            ref={inputRef}
            className="form-input"
            rows={3}
            placeholder="How did it go? Did you feel good about it?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: "none", marginBottom: 16 }}
            disabled={loading}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Check size={16} />
              {loading ? "Saving..." : "Mark as Done"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
