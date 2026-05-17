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
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    };
    return () => { _add = null; };
  }, []);

  const colors = { success: "#00ff87", error: "#ff6b6b", info: "#00c6ff" };
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <div style={{ position: "fixed", top: 20, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: "var(--bg-2)", border: `1px solid ${colors[t.type]}33`,
          borderRadius: "var(--radius-sm)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease",
        }}>
          <span style={{ color: colors[t.type], fontWeight: 700 }}>{icons[t.type]}</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}
