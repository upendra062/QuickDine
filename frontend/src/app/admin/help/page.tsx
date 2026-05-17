"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import { useWebSocket, playAlert } from "@/hooks/useWebSocket";
import { showToast } from "@/components/ui/Toast";

interface HelpReq { id: number; table_id: number; guest_name: string; type: string; message: string; status: string; created_at: string; }

const TYPE_ICONS: Record<string, string> = { waiter: "🧑‍🍳", water: "💧", cleaning: "🧹", bill: "🧾", custom: "💬" };

export default function AdminHelpPage() {
  const [reqs, setReqs] = useState<HelpReq[]>([]);

  function load() { api.get("/api/admin/help-requests").then((r) => setReqs(r.data)).catch(() => {}); }
  useEffect(() => { load(); }, []);

  const onWs = useCallback((payload: { type: string }) => {
    if (payload.type === "help_request") { playAlert("help"); load(); }
    if (payload.type === "help_resolved") load();
  }, []);
  useWebSocket("help", onWs);

  async function resolve(id: number) {
    await api.put(`/api/admin/help-requests/${id}/resolve`);
    showToast("Resolved");
    load();
  }

  const pending = reqs.filter((r) => r.status === "pending");
  const done = reqs.filter((r) => r.status === "done");

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 20 }}>Help Requests ({pending.length} pending)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
        {pending.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: "var(--radius-md)", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <span style={{ fontSize: "1.8rem" }}>{TYPE_ICONS[r.type] || "💬"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>Table {r.table_id} — {r.type}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{r.guest_name} · {fmtDate(r.created_at)}</p>
              {r.message && <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>{r.message}</p>}
            </div>
            <button onClick={() => resolve(r.id)} style={{ padding: "6px 16px", background: "var(--accent)", border: "none", borderRadius: 99, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", color: "#000" }}>Done</button>
          </div>
        ))}
        {!pending.length && <p style={{ color: "var(--text-muted)" }}>No pending help requests 🎉</p>}
      </div>
      <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 700, marginBottom: 12, color: "var(--text-muted)" }}>Resolved ({done.length})</h3>
      {done.slice(0, 10).map((r) => (
        <div key={r.id} style={{ display: "flex", gap: 12, padding: "10px 16px", marginBottom: 8, borderRadius: "var(--radius-sm)", background: "var(--glass)", border: "1px solid var(--glass-border)", opacity: 0.6 }}>
          <span>{TYPE_ICONS[r.type] || "💬"}</span>
          <p style={{ fontSize: "0.8rem" }}>Table {r.table_id} — {r.type} · {r.guest_name}</p>
        </div>
      ))}
    </div>
  );
}
