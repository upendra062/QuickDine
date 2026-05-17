"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { useWebSocket, playAlert } from "@/hooks/useWebSocket";
import { showToast } from "@/components/ui/Toast";

interface Order { id: string; table_id: number; guest_name: string; status: string; total: number; items: { name: string; qty: number }[]; created_at: string; }

const NEXT: Record<string, string> = { pending: "preparing", preparing: "ready", ready: "served" };
const bgColor: Record<string, string> = { pending: "rgba(245,158,11,0.08)", preparing: "rgba(0,198,255,0.08)", ready: "rgba(0,255,135,0.08)" };
const borderColor: Record<string, string> = { pending: "rgba(245,158,11,0.3)", preparing: "rgba(0,198,255,0.3)", ready: "rgba(0,255,135,0.3)" };

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    api.get("/api/admin/orders").then((r) => {
      setOrders(r.data.filter((o: Order) => ["pending", "preparing", "ready"].includes(o.status)));
    }).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const onWs = useCallback((payload: { type: string }) => {
    if (["new_order", "status_change"].includes(payload.type)) { playAlert("order"); load(); }
  }, []);
  useWebSocket("kitchen", onWs);

  function elapsed(ts: string) {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    return mins < 1 ? "Just now" : `${mins}m ago`;
  }

  async function advance(id: string, next: string) {
    await api.put(`/api/admin/orders/${id}/status`, { status: next });
    showToast(`Order ${id} → ${next}`);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 700 }}>LIVE KITCHEN</span>
        <button onClick={load} style={{ marginLeft: "auto", padding: "5px 14px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, fontSize: "0.75rem", cursor: "pointer", color: "var(--text-secondary)" }}>↻ Refresh</button>
      </div>
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
          <p style={{ color: "var(--text-muted)" }}>All orders served. Kitchen is clear!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ borderRadius: "var(--radius-lg)", padding: "18px 18px", background: bgColor[o.status], border: `1px solid ${borderColor[o.status]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-main)", fontWeight: 800 }}>Table {o.table_id}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{elapsed(o.created_at)}</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>#{o.id} · {o.guest_name}</p>
              <div style={{ marginBottom: 12 }}>
                {o.items?.map((item, i) => (
                  <p key={i} style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.name} <span style={{ color: "var(--accent)" }}>×{item.qty}</span></p>
                ))}
              </div>
              {NEXT[o.status] && (
                <button onClick={() => advance(o.id, NEXT[o.status])} style={{ width: "100%", padding: "8px", background: "var(--accent)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", color: "#000", textTransform: "capitalize" }}>
                  Mark {NEXT[o.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
