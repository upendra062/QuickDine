"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { fmt, fmtDate } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface Order { id: string; table_id: number; guest_name: string; phone: string | null; status: string; total: number; pay_mode: string; items: { name: string; qty: number }[]; created_at: string; }

const STATUSES = ["all", "pending", "preparing", "ready", "served", "cancelled"];
const NEXT: Record<string, string> = { pending: "preparing", preparing: "ready", ready: "served" };
const statusColor: Record<string, string> = { pending: "#f59e0b", preparing: "#00c6ff", ready: "#00ff87", served: "var(--text-muted)", cancelled: "#ef4444" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  function load(status?: string) {
    const q = status && status !== "all" ? `?status=${status}` : "";
    api.get(`/api/admin/orders${q}`).then((r) => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }

  useEffect(() => { load(tab); }, [tab]);

  async function advance(orderId: string, nextStatus: string) {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: nextStatus });
      showToast(`Order ${orderId} → ${nextStatus}`);
      load(tab);
    } catch { showToast("Update failed", "error"); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setTab(s)} style={{ flexShrink: 0, padding: "6px 16px", borderRadius: 99, border: "1px solid var(--glass-border)", background: tab === s ? "var(--accent)" : "var(--glass)", color: tab === s ? "#000" : "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
        ))}
      </div>
      {loading ? <p style={{ color: "var(--text-muted)" }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} className="glass-card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginRight: 10 }}>#{o.id}</span>
                  <span style={{ fontSize: "0.75rem", color: statusColor[o.status], fontWeight: 700, textTransform: "capitalize" }}>{o.status}</span>
                </div>
                <span style={{ color: "var(--accent)", fontWeight: 800 }}>{fmt(o.total)}</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 4 }}>Table {o.table_id} · {o.guest_name}{o.phone ? ` · ${o.phone}` : ""}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>{o.items?.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{fmtDate(o.created_at)}</span>
                {NEXT[o.status] && (
                  <button onClick={() => advance(o.id, NEXT[o.status])} style={{ padding: "6px 16px", background: "var(--accent)", border: "none", borderRadius: 99, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", color: "#000", textTransform: "capitalize" }}>
                    → {NEXT[o.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
          {!orders.length && <p style={{ color: "var(--text-muted)" }}>No orders in this category.</p>}
        </div>
      )}
    </div>
  );
}
