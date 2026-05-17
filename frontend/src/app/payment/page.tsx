"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useCart } from "@/store/cartStore";
import { fmt } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

declare global {
  interface Window { Razorpay: new (opts: object) => { open: () => void }; }
}

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const id = sessionStorage.getItem("pending_order_id") || "";
    const amt = Number(sessionStorage.getItem("pending_order_total") || 0);
    setOrderId(id);
    setAmount(amt);
    if (!id) { router.push("/cart"); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, [router]);

  async function pay() {
    setLoading(true);
    try {
      const { data } = await api.post("/api/payment/create", { order_id: orderId, amount });
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.razorpay_order_id,
        name: "QuickDine",
        description: `Order ${orderId}`,
        theme: { color: "#00ff87" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await api.post("/api/payment/verify", {
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            useCart.getState().clear();
            sessionStorage.removeItem("pending_order_id");
            sessionStorage.removeItem("pending_order_total");
            router.push(`/tracking?order=${orderId}`);
          } catch { showToast("Payment verification failed", "error"); }
        },
      });
      rzp.open();
    } catch { showToast("Payment gateway error", "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center", gap: 20, padding: 24 }}>
      <ToastContainer />
      <div className="glass-card" style={{ width: "100%", maxWidth: 400, padding: "32px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>💳</div>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem", marginBottom: 8 }}>Pay Now</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 6 }}>Order <strong>{orderId}</strong></p>
        <p style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "2rem", color: "var(--accent)", marginBottom: 24 }}>{fmt(amount)}</p>
        <button onClick={pay} className="btn-primary" disabled={loading}>{loading ? "Opening…" : "Pay via Razorpay"}</button>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {["🔒 Secure", "UPI", "Card", "Wallet"].map((b) => (
            <span key={b} style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
