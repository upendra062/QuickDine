"use client";
import { useEffect, useState } from "react";

interface Toast { id: number; msg: string; type: "success" | "error" | "info"; }
let _add: ((msg: string, type: Toast["type"]) => void) | null = null;
export const showToast = (msg: string, type: Toast["type"] = "success") => _add?.(msg, type);

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _add = (msg, type) => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
    return () => { _add = null; };
  }, []);

  const meta = {
    success: { color: "var(--green)",  icon: "✓" },
    error:   { color: "var(--red)",    icon: "✕" },
    info:    { color: "var(--orange)", icon: "ℹ" },
  };

  return (
    <div style={{ position: "fixed", top: 20, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
          background: "var(--bg-3)", border: `1px solid ${meta[t.type].color}33`,
          borderLeft: `3px solid ${meta[t.type].color}`,
          borderRadius: "var(--radius-sm)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          animation: "slideIn 0.28s ease", minWidth: 200,
        }}>
          <span style={{ color: meta[t.type].color, fontWeight: 800, fontSize: "0.85rem" }}>{meta[t.type].icon}</span>
          <span style={{ fontSize: "0.84rem", color: "var(--text-1)", fontWeight: 500 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
