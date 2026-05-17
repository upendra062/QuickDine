"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

const STAGES = [
  { key: "pending", label: "Order Placed", icon: "📋", eta: "Just now" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳", eta: "~10 min" },
  { key: "ready", label: "Ready to Serve", icon: "🔔", eta: "~5 min" },
  { key: "served", label: "Served", icon: "✅", eta: "Enjoy!" },
];

function TrackingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order") || "";
  const [status, setStatus] = useState("pending");
  const [order, setOrder] = useState<{ id: string; table_id: number; total: number } | null>(null);

  useEffect(() => {
    if (!orderId) { router.push("/orders"); return; }
    api.get(`/api/orders/${orderId}`).then((r) => { setOrder(r.data); setStatus(r.data.status); }).catch(() => {});
  }, [orderId, router]);

  const onMessage = useCallback((payload: { type: string; data: unknown }) => {
    if (payload.type === "status_change" && (payload.data as { id: string }).id === orderId) {
      setStatus((payload.data as { status: string }).status);
    }
  }, [orderId]);

  useWebSocket(`order_${orderId}`, onMessage);

  const stageIdx = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ padding: "56px 20px 24px", background: "linear-gradient(135deg,rgba(0,255,135,0.06),transparent)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Link href="/home" style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "1.2rem" }}>←</Link>
          <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.4rem" }}>Live Tracking</h1>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", padding: "4px 10px", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", borderRadius: 99, color: "var(--accent)" }}>● LIVE</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Order #{orderId} · Table {order?.table_id}</p>
      </div>

      <div className="page-content">
        <div className="glass-card" style={{ padding: "24px 20px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>{STAGES[Math.max(0, stageIdx)].icon}</div>
          <h2 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.4rem", marginBottom: 4 }}>{STAGES[Math.max(0, stageIdx)].label}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ETA: {STAGES[Math.max(0, stageIdx)].eta}</p>
        </div>

        <div className="glass-card" style={{ padding: "20px 18px" }}>
          {STAGES.filter((s) => s.key !== "served").map((stage, idx) => (
            <div key={stage.key} style={{ display: "flex", gap: 14, marginBottom: idx < 2 ? 20 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", background: idx <= stageIdx ? "var(--accent)" : "var(--glass)", border: `2px solid ${idx <= stageIdx ? "var(--accent)" : "var(--glass-border)"}`, transition: "var(--transition)" }}>
                  {idx <= stageIdx ? "✓" : stage.icon}
                </div>
                {idx < 2 && <div style={{ width: 2, flex: 1, minHeight: 20, background: idx < stageIdx ? "var(--accent)" : "var(--glass-border)", marginTop: 4 }} />}
              </div>
              <div style={{ paddingTop: 6 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: idx <= stageIdx ? "var(--text-primary)" : "var(--text-muted)" }}>{stage.label}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stage.eta}</p>
              </div>
            </div>
          ))}
        </div>

        {status === "served" && (
          <Link href="/rating" className="btn-primary" style={{ marginTop: 20, display: "flex" }}>Rate Your Experience ⭐</Link>
        )}
      </div>
    </div>
  );
}

export default function Page() { return <Suspense><TrackingPage /></Suspense>; }
