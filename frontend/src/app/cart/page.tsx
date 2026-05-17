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
  const { name, phone, tableId } = useSession();
  const [coupon, setCoupon] = useState("");
  const [couponData, setCouponData] = useState<{ discount: number; type: string } | null>(null);
  const [payMode, setPayMode] = useState<"pay_now" | "pay_later">("pay_later");
  const [redeemPts, setRedeemPts] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    if (phone) api.get(`/api/rewards/${phone}`).then((r) => setUserPoints(r.data.points)).catch(() => {});
  }, [phone, router]);

  const subtotal = total();
  const couponDiscount = couponData ? (couponData.type === "flat" ? couponData.discount : subtotal * couponData.discount / 100) : 0;
  const pointsDiscount = redeemPts * 0.1;
  const taxable = Math.max(subtotal - couponDiscount - pointsDiscount, 0);
  const tax = +(taxable * 0.05).toFixed(2);
  const finalTotal = +(taxable + tax).toFixed(2);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.get(`/api/coupons/validate/${coupon.toUpperCase()}`);
      if (data.valid) { setCouponData({ discount: data.discount, type: data.type }); showToast("Coupon applied! 🎉"); }
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
        pay_mode: payMode, coupon_code: couponData ? coupon.toUpperCase() : null, points_redeemed: redeemPts,
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
      <div style={{ fontSize: "3.5rem" }}>🛒</div>
      <p style={{ color: "var(--text-2)", fontWeight: 600 }}>Your cart is empty</p>
      <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Add some delicious dishes!</p>
      <Link href="/menu" className="btn-primary" style={{ maxWidth: 200 }}>Browse Menu</Link>
      <BottomNav />
    </div>
  );

  return (
    <div className="page">
      <ToastContainer />
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-1)", fontSize: "1rem" }}>←</button>
        <span style={{ fontFamily: "var(--font)", fontWeight: 800, fontSize: "1.3rem", flex: 1 }}>Your Cart</span>
        <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>{count()} items</span>
      </div>

      <div className="page-content" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Items */}
        <div className="card" style={{ padding: "4px 0" }}>
          {items.map((item, idx) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.is_veg ? "var(--green)" : "var(--red)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{item.name}</p>
                <p style={{ color: "var(--orange)", fontWeight: 800, fontSize: "0.82rem" }}>{fmt(item.price)} × {item.qty} = {fmt(item.price * item.qty)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid var(--border-hot)", background: "transparent", color: "var(--orange)", cursor: "pointer", fontWeight: 800 }}>−</button>
                <span style={{ width: 18, textAlign: "center", fontWeight: 700, fontSize: "0.88rem" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--orange)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 800 }}>+</button>
                <button onClick={() => remove(item.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "var(--red)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment mode */}
        <div className="card" style={{ padding: "16px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 10 }}>Payment Mode</p>
          {(["pay_now", "pay_later"] as const).map((mode) => (
            <div key={mode} onClick={() => setPayMode(mode)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, borderRadius: "var(--radius-md)", border: `2px solid ${payMode === mode ? "var(--orange)" : "var(--border)"}`, cursor: "pointer", background: payMode === mode ? "rgba(249,115,22,0.06)" : "transparent", transition: "var(--transition)" }}>
              <span style={{ fontSize: "1.3rem" }}>{mode === "pay_now" ? "💳" : "🍽️"}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.86rem" }}>{mode === "pay_now" ? "Pay Now & Earn Points" : "Pay Later"}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{mode === "pay_now" ? "Online · earn rewards instantly" : "Pay when food arrives"}</p>
              </div>
              <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", border: `2px solid ${payMode === mode ? "var(--orange)" : "var(--border)"}`, background: payMode === mode ? "var(--orange)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {payMode === mode && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Redeem points */}
        {phone && userPoints >= 100 && (
          <div className="card" style={{ padding: "16px", background: "linear-gradient(135deg,rgba(168,85,247,0.06),rgba(236,72,153,0.04))", borderColor: "rgba(168,85,247,0.2)" }}>
            <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 10 }}>🏆 Redeem Points <span style={{ color: "var(--text-3)", fontWeight: 400 }}>({userPoints} available)</span></p>
            <input type="range" min={0} max={Math.min(userPoints, Math.floor(subtotal / 0.1))} step={100} value={redeemPts} onChange={(e) => setRedeemPts(Number(e.target.value))} style={{ width: "100%", accentColor: "#a855f7", marginBottom: 8 }} />
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Redeeming {redeemPts} pts = <strong style={{ color: "#a855f7" }}>{fmt(pointsDiscount)} off</strong></p>
          </div>
        )}

        {/* Coupon */}
        <div className="card" style={{ padding: "16px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 10 }}>🎟️ Have a coupon?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" placeholder="Enter code (e.g. RASOI20)" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: "10px 14px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-1)", fontSize: "0.84rem", outline: "none", fontFamily: "var(--font)", letterSpacing: "0.05em" }} />
            <button onClick={applyCoupon} style={{ padding: "10px 18px", background: "transparent", border: "1.5px solid var(--border-hot)", color: "var(--orange)", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--font)" }}>Apply</button>
          </div>
          {couponData && <p style={{ marginTop: 8, fontSize: "0.76rem", color: "var(--green)" }}>✓ Coupon applied — {couponData.type === "flat" ? fmt(couponData.discount) : `${couponData.discount}%`} off</p>}
        </div>

        {/* Bill summary */}
        <div className="card" style={{ padding: "16px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 12 }}>Bill Summary</p>
          {([
            ["Subtotal", fmt(subtotal)],
            ["GST (5%)", fmt(tax)],
            couponData && [`Coupon (${coupon})`, `− ${fmt(couponDiscount)}`],
            redeemPts > 0 && ["Points Discount", `− ${fmt(pointsDiscount)}`],
          ] as [string, string][]).filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", padding: "4px 0", color: "var(--text-2)" }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 8, borderTop: "1px solid var(--border)", fontWeight: 900, fontSize: "1.1rem" }}>
            <span>Total</span><span style={{ color: "var(--orange)" }}>{fmt(finalTotal)}</span>
          </div>
        </div>

        <button onClick={placeOrder} className="btn-primary" disabled={loading}>
          {loading ? "Placing your order…" : `${payMode === "pay_now" ? "Proceed to Pay" : "Place Order"} · ${fmt(finalTotal)}`}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
