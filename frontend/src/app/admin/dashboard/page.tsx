"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { useWebSocket, playAlert } from "@/hooks/useWebSocket";

interface Stats { today_revenue: number; today_orders: number; total_revenue: number; total_orders: number; }
interface Order { id: string; table_id: number; guest_name: string; status: string; total: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [helpCount, setHelpCount] = useState(0);

  function load() {
    api.get("/api/admin/analytics").then((r) => setStats(r.data)).catch(() => {});
    api.get("/api/admin/orders?status=pending").then((r) => setActiveOrders(r.data.slice(0, 6))).catch(() => {});
    api.get("/api/admin/help-requests?status=pending").then((r) => setHelpCount(r.data.length)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const onWs = useCallback((payload: { type: string }) => {
    if (payload.type === "new_order") { playAlert("order"); load(); }
    if (payload.type === "help_request") { playAlert("help"); load(); }
  }, []);
  useWebSocket("admin", onWs);

  const statCards = stats ? [
    { label: "Today Revenue", value: fmt(stats.today_revenue), sub: `${stats.today_orders} orders`, color: "var(--accent)" },
    { label: "Total Revenue", value: fmt(stats.total_revenue), sub: `${stats.total_orders} total orders`, color: "var(--accent-2)" },
    { label: "Active Orders", value: String(activeOrders.length), sub: "Need attention", color: "#f59e0b" },
    { label: "Help Requests", value: String(helpCount), sub: helpCount > 0 ? "Pending" : "All clear", color: helpCount > 0 ? "#ef4444" : "var(--accent)" },
  ] : [];

  const statusColor: Record<string, string> = { pending: "#f59e0b", preparing: "#00c6ff", ready: "#00ff87" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
        {statCards.map(({ label, value, sub, color }) => (
          <div key={label} className="glass-card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.8rem", color }}>{value}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "var(--font-main)", fontWeight: 700, marginBottom: 14 }}>Active Orders</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {activeOrders.map((o) => (
          <div key={o.id} className="glass-card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-main)", fontWeight: 700 }}>#{o.id}</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: statusColor[o.status], textTransform: "capitalize" }}>{o.status}</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Table {o.table_id} · {o.guest_name}</p>
            <p style={{ color: "var(--accent)", fontWeight: 800, marginTop: 4 }}>{fmt(o.total)}</p>
          </div>
        ))}
        {!activeOrders.length && <p style={{ color: "var(--text-muted)", gridColumn: "span 2" }}>No active orders right now 🎉</p>}
      </div>
    </div>
  );
}
