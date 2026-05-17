"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { fmt, fmtDate } from "@/lib/utils";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/ui/Toast";

interface Order { id: string; table_id: number; status: string; total: number; pay_mode: string; items: { name: string; qty: number }[]; created_at: string; }

export default function OrdersPage() {
  const router = useRouter();
  const { phone, tableId } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    const params = phone ? `?phone=${phone}` : `?table_id=${tableId}`;
    api.get(`/api/orders${params}`).then((r) => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [phone, tableId, router]);

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status === tab);
  const statusColor: Record<string, string> = { pending: "#f59e0b", preparing: "#00c6ff", ready: "#00ff87", served: "var(--text-muted)", cancelled: "#ef4444" };

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid var(--glass-border)" }}>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem" }}>My Orders</h1>
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
          {["all", "pending", "preparing", "ready", "served"].map((s) => (
            <button key={s} onClick={() => setTab(s)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 99, border: "1px solid var(--glass-border)", background: tab === s ? "var(--accent)" : "var(--glass)", color: tab === s ? "#000" : "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
          ))}
        </div>
      </div>
      <div className="page-content">
        {loading ? <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading…</p> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
            <p style={{ color: "var(--text-muted)" }}>No orders yet</p>
            <Link href="/menu" className="btn-primary" style={{ maxWidth: 200, marginTop: 16 }}>Order Now</Link>
          </div>
        ) : filtered.map((order) => (
          <div key={order.id} className="glass-card" style={{ padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-main)", fontWeight: 700 }}>#{order.id}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusColor[order.status] || "var(--text-muted)", textTransform: "capitalize" }}>{order.status}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>{order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--accent)", fontWeight: 800 }}>{fmt(order.total)}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{fmtDate(order.created_at)}</span>
            </div>
            {order.status === "served" && (
              <Link href="/rating" style={{ display: "block", marginTop: 10, textAlign: "center", fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>Rate this order ⭐</Link>
            )}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
