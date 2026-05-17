"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/ui/Toast";

export default function HomePage() {
  const router = useRouter();
  const { name, tableId } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [offers, setOffers] = useState<{ id: number; emoji: string; title: string; subtitle: string }[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    api.get("/api/settings").then((r) => setSettings(r.data)).catch(() => {});
    api.get("/api/admin/offers").catch(() => {});
  }, [router]);

  const actions = [
    { href: "/menu", icon: "🍽️", label: "Order Food", primary: true },
    { href: "/voice", icon: "🎙️", label: "Voice Order", color: "linear-gradient(135deg,#a855f7,#ec4899)" },
    { href: "/help", icon: "🆘", label: "Get Help", color: "linear-gradient(135deg,#f59e0b,#ef4444)" },
    { href: "/rewards", icon: "🏆", label: "Rewards", color: "linear-gradient(135deg,#00ff87,#00c6ff)" },
    { href: "/orders", icon: "📋", label: "My Orders", color: "linear-gradient(135deg,#6366f1,#a855f7)" },
    { href: "/tracking", icon: "📍", label: "Track Order", color: "linear-gradient(135deg,#f97316,#ef4444)" },
  ];

  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      <ToastContainer />
      <div style={{ padding: "56px 24px 24px", background: "linear-gradient(135deg,rgba(0,255,135,0.06) 0%,rgba(0,198,255,0.04) 100%)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Good to see you,</p>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.8rem", marginBottom: 4 }}>{name || "Guest"} 👋</h1>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "var(--glass)", border: "1px solid var(--glass-border)", padding: "4px 12px", borderRadius: 99 }}>
          Table {tableId} · {settings.rest_name || "QuickDine"}
        </span>
      </div>

      <div className="page-content">
        <h2 style={{ fontFamily: "var(--font-main)", fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>What can we do for you?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {actions.map(({ href, icon, label, primary, color }) => (
            <Link key={href} href={href} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "18px 10px", borderRadius: "var(--radius-lg)", textDecoration: "none",
              background: "var(--glass)", border: "1px solid var(--glass-border)",
              transition: "var(--transition)",
            }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", background: primary ? "linear-gradient(135deg,var(--accent),var(--accent-2))" : color || "var(--glass)", boxShadow: primary ? "0 4px 20px var(--accent-glow)" : "none" }}>
                {icon}
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "center", fontFamily: "var(--font-main)" }}>{label}</span>
            </Link>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-main)", fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>🔥 Today&apos;s Tips</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Try our voice assistant for the fastest ordering experience.<br />Earn {settings.points_per_rupee || 1} point per ₹1 spent!
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
