"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/ui/Toast";

const ACTIONS = [
  { href: "/menu",     icon: "🍽️", label: "Order Food",  bg: "linear-gradient(135deg,#F97316,#F59E0B)" },
  { href: "/voice",    icon: "🎙️", label: "Voice Order", bg: "linear-gradient(135deg,#A855F7,#EC4899)" },
  { href: "/help",     icon: "🆘", label: "Get Help",    bg: "linear-gradient(135deg,#EF4444,#F97316)" },
  { href: "/rewards",  icon: "🏆", label: "Rewards",     bg: "linear-gradient(135deg,#F59E0B,#EAB308)" },
  { href: "/orders",   icon: "📋", label: "My Orders",   bg: "linear-gradient(135deg,#6366F1,#A855F7)" },
  { href: "/tracking", icon: "📍", label: "Track Order", bg: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

export default function HomePage() {
  const router = useRouter();
  const { name, tableId } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    api.get("/api/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, [router]);

  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <div className="page">
      <ToastContainer />
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", background: "linear-gradient(160deg,#1A0E06,var(--bg))", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)" }} />
        <p style={{ color: "var(--text-2)", fontSize: "0.82rem", marginBottom: 2 }}>{greeting},</p>
        <h1 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.9rem", letterSpacing: "-0.02em" }}>{name || "Guest"} 👋</h1>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.74rem", padding: "4px 12px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)", borderRadius: 99, color: "var(--orange)", fontWeight: 700 }}>🪑 Table {tableId}</span>
          <span style={{ fontSize: "0.74px", padding: "4px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 99, color: "var(--text-2)", fontWeight: 600, fontSize: "0.74rem" }}>{settings.rest_name || "Rasoi"}</span>
        </div>
      </div>

      <div className="page-content">
        <p style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>What can we do for you?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {ACTIONS.map(({ href, icon, label, bg }) => (
            <Link key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 8px", borderRadius: "var(--radius-lg)", textDecoration: "none", background: "var(--bg-3)", border: "1px solid var(--border)", transition: "var(--transition)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", background: bg, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>{icon}</div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-2)", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Tip card */}
        <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(245,158,11,0.05))", border: "1px solid rgba(249,115,22,0.16)", borderRadius: "var(--radius-lg)", padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>💡</div>
          <div>
            <p style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>Pro tip</p>
            <p style={{ fontSize: "0.80rem", color: "var(--text-2)", lineHeight: 1.5 }}>Use <strong style={{ color: "var(--orange)" }}>Voice Order</strong> for the fastest experience. Earn {settings.points_per_rupee || 1} pt per ₹1 spent!</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
