"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { fmt } from "@/lib/utils";
import BottomNav from "@/components/layout/BottomNav";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

interface Coupon { id: number; code: string; discount: number; used: boolean; expires_at: string | null; }
interface Rewards { phone: string; name: string; points: number; total_spent: number; coupons: Coupon[]; }

export default function RewardsPage() {
  const router = useRouter();
  const { phone } = useSession();
  const [data, setData] = useState<Rewards | null>(null);
  const [redeemPts, setRedeemPts] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    if (!phone) return;
    api.get(`/api/rewards/${phone}`).then((r) => setData(r.data)).catch(() => {});
  }, [phone, router]);

  async function redeem() {
    if (!phone || !data || data.points < redeemPts) { showToast("Insufficient points", "error"); return; }
    setLoading(true);
    try {
      const { data: r } = await api.post("/api/rewards/redeem", { phone, points_to_redeem: redeemPts });
      showToast(`Coupon ${r.code} generated! Worth ${fmt(r.discount)}`);
      api.get(`/api/rewards/${phone}`).then((x) => setData(x.data));
    } catch { showToast("Redemption failed", "error"); }
    finally { setLoading(false); }
  }

  const tier = !data ? "Bronze" : data.points >= 5000 ? "Gold" : data.points >= 1000 ? "Silver" : "Bronze";
  const tierColor: Record<string, string> = { Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#f59e0b" };

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "56px 20px 20px", background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(236,72,153,0.06))", borderBottom: "1px solid var(--glass-border)" }}>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem" }}>🏆 Rewards</h1>
      </div>
      <div className="page-content">
        {!phone ? (
          <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>Enter your phone number at the welcome screen to earn rewards.</p>
          </div>
        ) : data ? (
          <>
            <div style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", borderRadius: "var(--radius-lg)", padding: "24px 20px", marginBottom: 16, color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ opacity: 0.8, fontSize: "0.8rem" }}>Your Points</p>
                  <p style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "2.4rem" }}>{data.points.toLocaleString()}</p>
                  <p style={{ opacity: 0.8, fontSize: "0.78rem" }}>Total spent: {fmt(data.total_spent)}</p>
                </div>
                <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700, color: tierColor[tier] }}>{tier}</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, marginBottom: 10, fontSize: "0.9rem" }}>Redeem Points</p>
              <input type="range" min={100} max={data.points} step={100} value={redeemPts} onChange={(e) => setRedeemPts(Number(e.target.value))} style={{ width: "100%", accentColor: "#a855f7", marginBottom: 8 }} disabled={data.points < 100} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>
                <span>Redeeming: {redeemPts} pts</span>
                <span>Value: {fmt(redeemPts * 0.1)}</span>
              </div>
              <button onClick={redeem} disabled={loading || data.points < 100} className="btn-primary">{loading ? "Generating…" : "Generate Coupon"}</button>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 10, fontSize: "0.9rem" }}>Your Coupons</p>
            {data.coupons.filter((c) => !c.used).map((c) => (
              <div key={c.id} className="glass-card" style={{ padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-main)", fontWeight: 800, color: "var(--accent)", letterSpacing: 2 }}>{c.code}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{fmt(c.discount)} flat off</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(c.code); showToast("Copied!"); }} style={{ padding: "6px 14px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}>Copy</button>
              </div>
            ))}
          </>
        ) : <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading…</p>}
      </div>
      <BottomNav />
    </div>
  );
}
