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

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: "#FBBF24", bg: "rgba(251,191,36,0.10)",  label: "Pending" },
  preparing: { color: "#60A5FA", bg: "rgba(96,165,250,0.10)",  label: "Preparing" },
  ready:     { color: "#22C55E", bg: "rgba(34,197,94,0.10)",   label: "Ready" },
  served:    { color: "#6B7280", bg: "rgba(107,114,128,0.10)", label: "Served" },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.10)",   label: "Cancelled" },
};

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

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.7rem", marginBottom: 14 }}>My Orders</h1>
        <div className="chips-row">
          {["all", "pending", "preparing", "ready", "served"].map((s) => (
            <button key={s} className={`chip${tab === s ? " active" : ""}`} onClick={() => setTab(s)} style={{ textTransform: "capitalize" }}>{s}</button>
          ))}
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <p style={{ color: "var(--text-3)", textAlign: "center", paddingTop: 40 }}>Loading orders…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
            <p style={{ color: "var(--text-2)", fontWeight: 600, marginBottom: 6 }}>No orders yet</p>
            <p style={{ color: "var(--text-3)", fontSize: "0.82rem", marginBottom: 20 }}>Your orders will appear here</p>
            <Link href="/menu" className="btn-primary" style={{ maxWidth: 200 }}>Browse Menu</Link>
          </div>
        ) : filtered.map((order) => {
          const st = STATUS_STYLE[order.status] || STATUS_STYLE.served;
          return (
            <div key={order.id} className="card" style={{ padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font)", fontWeight: 800, fontSize: "0.9rem" }}>#{order.id}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: st.color, background: st.bg, padding: "3px 10px", borderRadius: 99 }}>{st.label}</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 10, lineHeight: 1.4 }}>{order.items.map((i) => `${i.name} ×${i.qty}`).join(" · ")}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--orange)", fontWeight: 900, fontSize: "1rem" }}>{fmt(order.total)}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{fmtDate(order.created_at)}</span>
              </div>
              {["pending", "preparing", "ready"].includes(order.status) && (
                <Link href={`/tracking?order=${order.id}`} style={{ display: "block", marginTop: 10, textAlign: "center", fontSize: "0.78rem", color: "var(--orange)", textDecoration: "none", fontWeight: 700 }}>Track this order →</Link>
              )}
              {order.status === "served" && (
                <Link href="/rating" style={{ display: "block", marginTop: 10, textAlign: "center", fontSize: "0.78rem", color: "var(--amber)", textDecoration: "none", fontWeight: 700 }}>Rate this order ⭐</Link>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
