"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

const STAGES = [
  { key: "pending",   label: "Order Received",  icon: "📋", desc: "We've got your order" },
  { key: "preparing", label: "Preparing",        icon: "👨‍🍳", desc: "Chef is cooking for you" },
  { key: "ready",     label: "Ready to Serve",   icon: "🔔", desc: "Your food is ready!" },
  { key: "served",    label: "Served",           icon: "✅", desc: "Enjoy your meal!" },
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
    if (payload.type === "status_change" && (payload.data as { id: string }).id === orderId)
      setStatus((payload.data as { status: string }).status);
  }, [orderId]);

  useWebSocket(`order_${orderId}`, onMessage);

  const stageIdx = STAGES.findIndex((s) => s.key === status);
  const current = STAGES[Math.max(0, stageIdx)];

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", background: "linear-gradient(160deg,#1A0E06,var(--bg))", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Link href="/home" style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-1)", textDecoration: "none", fontSize: "1rem", flexShrink: 0 }}>←</Link>
          <h1 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.4rem", flex: 1 }}>Live Tracking</h1>
          <span style={{ fontSize: "0.7rem", padding: "4px 10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 99, color: "var(--green)", fontWeight: 700 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginRight: 5, animation: "pulse 1.5s infinite" }} />LIVE
          </span>
        </div>
        <p style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>Order #{orderId} · Table {order?.table_id}</p>
      </div>

      <div className="page-content">
        {/* Status hero */}
        <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.10),rgba(245,158,11,0.06))", border: "1px solid rgba(249,115,22,0.18)", borderRadius: "var(--radius-xl)", padding: "28px 20px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: "3.2rem", marginBottom: 10 }}>{current.icon}</div>
          <h2 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.5rem", marginBottom: 6 }}>{current.label}</h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.86rem" }}>{current.desc}</p>
        </div>

        {/* Timeline */}
        <div className="card" style={{ padding: "20px 18px" }}>
          {STAGES.map((stage, idx) => (
            <div key={stage.key} style={{ display: "flex", gap: 14, marginBottom: idx < STAGES.length - 1 ? 0 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: idx <= stageIdx ? "1rem" : "0.9rem", background: idx <= stageIdx ? "linear-gradient(135deg,var(--orange),var(--amber))" : "var(--bg-2)", border: `2px solid ${idx <= stageIdx ? "var(--orange)" : "var(--border)"}`, transition: "var(--transition)", color: idx <= stageIdx ? "#fff" : "var(--text-3)", flexShrink: 0 }}>
                  {idx <= stageIdx ? "✓" : stage.icon}
                </div>
                {idx < STAGES.length - 1 && (
                  <div style={{ width: 2, height: 32, background: idx < stageIdx ? "var(--orange)" : "var(--border)", margin: "4px 0", borderRadius: 99, transition: "var(--transition)" }} />
                )}
              </div>
              <div style={{ paddingTop: 6, paddingBottom: idx < STAGES.length - 1 ? 8 : 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: idx <= stageIdx ? "var(--text-1)" : "var(--text-3)" }}>{stage.label}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 2 }}>{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {status === "served" && (
          <Link href="/rating" className="btn-primary" style={{ marginTop: 16, display: "flex" }}>Rate Your Experience ⭐</Link>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

export default function Page() { return <Suspense><TrackingPage /></Suspense>; }
