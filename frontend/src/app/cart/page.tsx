"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cartStore";
import { useSession } from "@/store/sessionStore";
import { fmt } from "@/lib/utils";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";
import BottomNav from "@/components/layout/BottomNav";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, remove, total, count } = useCart();
  const { name, phone, tableId, isPremium } = useSession();
  const [coupon, setCoupon] = useState("");
  const [couponData, setCouponData] = useState<{ discount: number; type: string } | null>(null);
  const [payMode, setPayMode] = useState<"pay_now" | "pay_later">("pay_later");
  const [redeemPts, setRedeemPts] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [taxRate] = useState(0.05);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    if (phone) api.get(`/api/rewards/${phone}`).then((r) => setUserPoints(r.data.points)).catch(() => {});
  }, [phone, router]);

  const subtotal = total();
  const couponDiscount = couponData ? (couponData.type === "flat" ? couponData.discount : subtotal * couponData.discount / 100) : 0;
  const pointsDiscount = redeemPts * 0.1;
  const taxable = Math.max(subtotal - couponDiscount - pointsDiscount, 0);
  const tax = +(taxable * taxRate).toFixed(2);
  const finalTotal = +(taxable + tax).toFixed(2);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.get(`/api/coupons/validate/${coupon.toUpperCase()}`);
      if (data.valid) { setCouponData({ discount: data.discount, type: data.type }); showToast("Coupon applied!"); }
      else showToast(data.message, "error");
    } catch { showToast("Invalid coupon", "error"); }
  }

  async function placeOrder() {
    if (!items.length) { showToast("Cart is empty", "error"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/orders", {
        table_id: tableId, guest_name: name, phone,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, img_url: i.img_url, is_veg: i.is_veg })),
        pay_mode: payMode, coupon_code: couponData ? coupon.toUpperCase() : null,
        points_redeemed: redeemPts,
      });

      if (payMode === "pay_now") {
        sessionStorage.setItem("pending_order_id", data.id);
        sessionStorage.setItem("pending_order_total", String(finalTotal));
        router.push("/payment");
      } else {
        useCart.getState().clear();
        router.push(`/tracking?order=${data.id}`);
      }
    } catch { showToast("Could not place order. Try again.", "error"); }
    finally { setLoading(false); }
  }

  if (count() === 0) return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
      <ToastContainer />
      <div style={{ fontSize: "3rem" }}>🛒</div>
      <p style={{ color: "var(--text-muted)" }}>Your cart is empty</p>
      <Link href="/menu" className="btn-primary" style={{ maxWidth: 200 }}>Browse Menu</Link>
      <BottomNav />
    </div>
  );

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(9,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--glass-border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, fontSize: "1.3rem" }}>Your Cart</span>
      </div>

      <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass-card" style={{ padding: "16px 18px" }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--glass-border)" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.name}</p>
                <p style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.85rem" }}>{fmt(item.price)} × {item.qty}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}>−</button>
                <span style={{ width: 20, textAlign: "center", fontWeight: 700 }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", border: "none", color: "#000", cursor: "pointer", fontWeight: 800 }}>+</button>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>Payment Mode</p>
          {(["pay_now", "pay_later"] as const).map((mode) => (
            <div key={mode} onClick={() => setPayMode(mode)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, borderRadius: "var(--radius-sm)", border: `2px solid ${payMode === mode ? "var(--accent)" : "var(--glass-border)"}`, cursor: "pointer", background: payMode === mode ? "rgba(0,255,135,0.05)" : "transparent" }}>
              <span style={{ fontSize: "1.2rem" }}>{mode === "pay_now" ? "💳" : "🍽️"}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>{mode === "pay_now" ? "Pay Now & Earn Points" : "Pay Later"}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{mode === "pay_now" ? "Online payment · earn rewards" : "Pay when food arrives"}</p>
              </div>
            </div>
          ))}
        </div>

        {phone && userPoints >= 100 && (
          <div className="glass-card" style={{ padding: "16px 18px", background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(236,72,153,0.06))", border: "1px solid rgba(168,85,247,0.2)" }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>🏆 Redeem Points ({userPoints} available)</p>
            <input type="range" min={0} max={Math.min(userPoints, Math.floor(subtotal / 0.1))} step={100} value={redeemPts} onChange={(e) => setRedeemPts(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent-3)" }} />
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>Redeeming {redeemPts} pts = {fmt(pointsDiscount)} discount</p>
          </div>
        )}

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: "0.9rem" }}>🎟️ Coupon</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" placeholder="Enter coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
            <button onClick={applyCoupon} style={{ padding: "10px 16px", background: "var(--glass)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Apply</button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          {[["Subtotal", fmt(subtotal)], ["Tax (5%)", fmt(tax)], couponData && [`Coupon (${coupon})`, `-${fmt(couponDiscount)}`], redeemPts > 0 && ["Points Discount", `-${fmt(pointsDiscount)}`]].filter(Boolean).map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "4px 0", color: "var(--text-secondary)" }}>
              <span>{k as string}</span><span>{v as string}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTop: "1px solid var(--glass-border)", fontWeight: 800, fontSize: "1.1rem" }}>
            <span>Total</span><span style={{ color: "var(--accent)" }}>{fmt(finalTotal)}</span>
          </div>
        </div>

        <button onClick={placeOrder} className="btn-primary" disabled={loading}>
          {loading ? "Placing…" : `${payMode === "pay_now" ? "Proceed to Pay" : "Place Order"} · ${fmt(finalTotal)}`}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
