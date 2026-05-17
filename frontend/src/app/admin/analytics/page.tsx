"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { fmt } from "@/lib/utils";

interface Analytics {
  today_revenue: number; today_orders: number; total_revenue: number; total_orders: number;
  revenue_7d: { date: string; revenue: number; orders: number }[];
  popular_items: { name: string; count: number; revenue: number }[];
  top_customers: { phone: string; name: string; points: number; spent: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => { api.get("/api/admin/analytics").then((r) => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <p style={{ color: "var(--text-muted)" }}>Loading analytics…</p>;

  const maxRev = Math.max(...data.revenue_7d.map((d) => d.revenue), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {[
          { label: "Today Revenue", value: fmt(data.today_revenue), sub: `${data.today_orders} orders` },
          { label: "Total Revenue", value: fmt(data.total_revenue), sub: `${data.total_orders} all time` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="glass-card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.8rem", color: "var(--accent)" }}>{value}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 20 }}>Revenue — Last 7 Days</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {data.revenue_7d.map((d) => (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", background: "linear-gradient(to top,var(--accent),var(--accent-2))", borderRadius: "4px 4px 0 0", height: `${Math.max((d.revenue / maxRev) * 100, 4)}%`, transition: "height 0.5s ease" }} />
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textAlign: "center" }}>{d.date.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 14 }}>Popular Items</h3>
        {data.popular_items.map((item, i) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < data.popular_items.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
            <span style={{ fontFamily: "var(--font-main)", fontWeight: 900, color: "var(--text-muted)", width: 20 }}>#{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>{item.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.count} orders</p>
            </div>
            <span style={{ color: "var(--accent)", fontWeight: 800 }}>{fmt(item.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
