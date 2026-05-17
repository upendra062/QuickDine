"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";
import BottomNav from "@/components/layout/BottomNav";

const HELP_TYPES = [
  { type: "waiter", emoji: "🧑‍🍳", label: "Call Waiter", color: "#ef4444" },
  { type: "water", emoji: "💧", label: "Water Please", color: "#00c6ff" },
  { type: "cleaning", emoji: "🧹", label: "Table Cleaning", color: "#f59e0b" },
  { type: "bill", emoji: "🧾", label: "Get Bill", color: "#00ff87" },
];

export default function HelpPage() {
  const router = useRouter();
  const { name, tableId } = useSession();
  const [sent, setSent] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function sendHelp(type: string, label: string) {
    setLoading(type);
    try {
      await api.post("/api/help", { table_id: tableId, guest_name: name || "Guest", type, message: label });
      setSent((s) => [...s, type]);
      showToast(`${label} request sent! We'll be right there.`);
    } catch { showToast("Request failed. Try again.", "error"); }
    finally { setLoading(null); }
  }

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "56px 20px 24px", background: "linear-gradient(135deg,rgba(245,158,11,0.06),transparent)", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.4rem" }}>Need Help?</h1>
      </div>
      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {HELP_TYPES.map(({ type, emoji, label, color }) => (
            <button key={type} onClick={() => sendHelp(type, label)} disabled={!!loading || sent.includes(type)} style={{
              padding: "24px 16px", borderRadius: "var(--radius-lg)", background: sent.includes(type) ? "rgba(0,255,135,0.08)" : "var(--glass)",
              border: `2px solid ${sent.includes(type) ? "var(--accent)" : "var(--glass-border)"}`,
              cursor: sent.includes(type) ? "default" : "pointer", transition: "var(--transition)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: "2.2rem" }}>{emoji}</span>
              <span style={{ fontFamily: "var(--font-main)", fontWeight: 700, fontSize: "0.88rem", color: sent.includes(type) ? "var(--accent)" : "var(--text-primary)" }}>
                {loading === type ? "Sending…" : sent.includes(type) ? "Sent ✓" : label}
              </span>
            </button>
          ))}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", textAlign: "center", marginTop: 24 }}>Staff has been notified and will assist you shortly.</p>
      </div>
      <BottomNav />
    </div>
  );
}
