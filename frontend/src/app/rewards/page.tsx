"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { fmt } from "@/lib/utils";
import BottomNav from "@/components/layout/BottomNav";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

interface Coupon  { id: number; code: string; discount: number; used: boolean; expires_at: string | null; }
interface Rewards { phone: string; name: string; points: number; total_spent: number; coupons: Coupon[]; }

const TIERS = [
  { name: "Bronze", min: 0,    color: "#CD7F32", icon: "🥉" },
  { name: "Silver", min: 1000, color: "#C0C0C0", icon: "🥈" },
  { name: "Gold",   min: 5000, color: "#F59E0B", icon: "🥇" },
];

export default function RewardsPage() {
  const router = useRouter();
  const { phone } = useSession();
  const [data, setData] = useState<Rewards | null>(null);
  const [redeemPts, setRedeemPts] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    if (phone) api.get(`/api/rewards/${phone}`).then((r) => setData(r.data)).catch(() => {});
  }, [phone, router]);

  async function redeem() {
    if (!phone || !data || data.points < redeemPts) { showToast("Insufficient points", "error"); return; }
    setLoading(true);
    try {
      const { data: r } = await api.post("/api/rewards/redeem", { phone, points_to_redeem: redeemPts });
      showToast(`Coupon ${r.code} — worth ${fmt(r.discount)} 🎉`);
      api.get(`/api/rewards/${phone}`).then((x) => setData(x.data));
    } catch { showToast("Redemption failed", "error"); }
    finally { setLoading(false); }
  }

  const tier = !data ? TIERS[0] : TIERS.slice().reverse().find((t) => data.points >= t.min) || TIERS[0];
  const nextTier = TIERS[TIERS.findIndex((t) => t.name === tier.name) + 1];
  const progress = nextTier ? Math.min((data?.points ?? 0) / nextTier.min * 100, 100) : 100;

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "52px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.7rem" }}>🏆 Rewards</h1>
      </div>

      <div className="page-content">
        {!phone ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏆</div>
            <p style={{ color: "var(--text-2)", fontWeight: 600, marginBottom: 6 }}>No phone number linked</p>
            <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Enter your phone at the welcome screen to earn rewards.</p>
          </div>
        ) : data ? (
          <>
            {/* Points card */}
            <div style={{ background: "linear-gradient(135deg,#1A0E06,#2D1A08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--radius-xl)", padding: "24px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ color: "var(--text-3)", fontSize: "0.78rem", marginBottom: 4 }}>Your Points</p>
                  <p style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "2.8rem", color: "var(--amber)", lineHeight: 1 }}>{data.points.toLocaleString()}</p>
                  <p style={{ color: "var(--text-3)", fontSize: "0.76rem", marginTop: 4 }}>Total spent: {fmt(data.total_spent)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.8rem" }}>{tier.icon}</span>
                  <p style={{ fontWeight: 800, fontSize: "0.82rem", color: tier.color, marginTop: 4 }}>{tier.name}</p>
                </div>
              </div>
              {nextTier && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-3)", marginBottom: 6 }}>
                    <span>{data.points} pts</span>
                    <span>{nextTier.name} at {nextTier.min.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,var(--orange),var(--amber))`, borderRadius: 99, width: `${progress}%`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Redeem */}
            {data.points >= 100 && (
              <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 10 }}>Redeem Points</p>
                <input type="range" min={100} max={data.points} step={100} value={redeemPts} onChange={(e) => setRedeemPts(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--orange)", marginBottom: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 14 }}>
                  <span>Redeeming: <strong style={{ color: "var(--orange)" }}>{redeemPts} pts</strong></span>
                  <span>Value: <strong style={{ color: "var(--green)" }}>{fmt(redeemPts * 0.1)}</strong></span>
                </div>
                <button onClick={redeem} disabled={loading} className="btn-primary">{loading ? "Generating coupon…" : "Generate Coupon"}</button>
              </div>
            )}

            {/* Coupons */}
            {data.coupons.filter((c) => !c.used).length > 0 && (
              <>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 10 }}>Your Coupons</p>
                {data.coupons.filter((c) => !c.used).map((c) => (
                  <div key={c.id} className="card" style={{ padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,rgba(249,115,22,0.04),transparent)" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font)", fontWeight: 900, color: "var(--orange)", letterSpacing: "0.12em", fontSize: "1rem" }}>{c.code}</p>
                      <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: 2 }}>{fmt(c.discount)} flat off</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); showToast("Copied!"); }} style={{ padding: "7px 16px", background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 99, fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", color: "var(--orange)", fontFamily: "var(--font)" }}>Copy</button>
                  </div>
                ))}
              </>
            )}
          </>
        ) : <p style={{ color: "var(--text-3)", textAlign: "center", paddingTop: 40 }}>Loading rewards…</p>}
      </div>
      <BottomNav />
    </div>
  );
}
