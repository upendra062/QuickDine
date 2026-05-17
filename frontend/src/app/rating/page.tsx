"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

interface OrderItem { id: number; item_id: number; item_name: string; qty: number; unit_price: number; }
interface Order { id: string; order_items: OrderItem[]; }

export default function RatingPage() {
  const router = useRouter();
  const { name, phone } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [ratings, setRatings] = useState<Record<number, { rating: number; comment: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const orderId = sessionStorage.getItem("last_order_id");
    if (!orderId) { router.push("/orders"); return; }
    api.get(`/api/orders/${orderId}`).then((r) => {
      setOrder(r.data);
      const init: typeof ratings = {};
      (r.data.order_items || []).forEach((i: OrderItem) => { init[i.item_id] = { rating: 0, comment: "" }; });
      setRatings(init);
    }).catch(() => router.push("/orders"));
  }, [router]);

  async function submit() {
    if (!order) return;
    const reviews = Object.entries(ratings)
      .filter(([, v]) => v.rating > 0)
      .map(([itemId, v]) => ({ item_id: Number(itemId), order_id: order.id, phone, reviewer_name: name || "Guest", rating: v.rating, comment: v.comment }));
    if (!reviews.length) { showToast("Please rate at least one item", "error"); return; }
    setLoading(true);
    try {
      await api.post("/api/reviews", reviews);
      showToast("Thanks for your feedback!");
      router.push("/home");
    } catch { showToast("Submit failed", "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.3rem" }}>Rate Your Order</h1>
      </div>
      <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {order?.order_items?.map((item) => (
          <div key={item.item_id} className="glass-card" style={{ padding: "16px 18px" }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>{item.item_name}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[1,2,3,4,5].map((star) => (
                <button key={star} onClick={() => setRatings((r) => ({ ...r, [item.item_id]: { ...r[item.item_id], rating: star } }))}
                  style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer", opacity: (ratings[item.item_id]?.rating ?? 0) >= star ? 1 : 0.3 }}>⭐</button>
              ))}
            </div>
            <input type="text" placeholder="Optional comment…" value={ratings[item.item_id]?.comment || ""}
              onChange={(e) => setRatings((r) => ({ ...r, [item.item_id]: { ...r[item.item_id], comment: e.target.value } }))}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
          </div>
        ))}
        <button onClick={submit} className="btn-primary" disabled={loading}>{loading ? "Submitting…" : "Submit Reviews"}</button>
        <button onClick={() => router.push("/home")} className="btn-ghost">Skip</button>
      </div>
    </div>
  );
}
