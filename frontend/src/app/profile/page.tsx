"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/store/sessionStore";
import { useCart } from "@/store/cartStore";
import BottomNav from "@/components/layout/BottomNav";

const MENU_ITEMS = [
  { label: "📋  My Orders",   href: "/orders" },
  { label: "🏆  Rewards",     href: "/rewards" },
  { label: "📍  Track Order", href: "/tracking" },
  { label: "⭐  Rate Us",     href: "/rating" },
];

const THEMES = [
  { key: "dark",    icon: "🌑", label: "Dark" },
  { key: "chalk",   icon: "🤍", label: "Chalk" },
  { key: "light",   icon: "☀️", label: "Light" },
  { key: "premium", icon: "👑", label: "Gold" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { name, phone, tableId, clear } = useSession();
  const [activeTheme, setActiveTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("qd-theme") || "dark";
    setActiveTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function applyTheme(key: string) {
    setActiveTheme(key);
    document.documentElement.dataset.theme = key;
    localStorage.setItem("qd-theme", key);
  }

  function endSession() {
    clear();
    useCart.getState().clear();
    sessionStorage.clear();
    router.push("/");
  }

  const initials = name ? name.slice(0, 2).toUpperCase() : "GU";

  return (
    <div className="page">
      {/* Profile header */}
      <div style={{ padding:"52px 20px 24px", textAlign:"center", background:"linear-gradient(160deg,#1A0E06,var(--bg))", borderBottom:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, left:"50%", transform:"translateX(-50%)", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div className="anim-bounce-in" style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,var(--orange),var(--amber))", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontFamily:"var(--font)", fontWeight:900, fontSize:"1.7rem", color:"#fff", boxShadow:"0 8px 28px rgba(249,115,22,0.40)", position:"relative" }}>
          {initials}
          <span style={{ position:"absolute", inset:-3, borderRadius:"50%", border:"1.5px solid rgba(249,115,22,0.30)", animation:"glowPulse 2.5s ease-in-out infinite" }} />
        </div>

        <h1 className="anim-fade-up" style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.4rem", marginBottom:4 }}>{name || "Guest"}</h1>
        {phone && <p className="anim-fade-up anim-s1" style={{ color:"var(--text-3)", fontSize:"0.84rem", marginBottom:8 }}>{phone}</p>}
        <span className="anim-fade-up anim-s2" style={{ fontSize:"0.74rem", padding:"4px 14px", background:"rgba(249,115,22,0.10)", border:"1px solid rgba(249,115,22,0.20)", borderRadius:99, color:"var(--orange)", fontWeight:700 }}>🪑 Table {tableId}</span>
      </div>

      <div className="page-content">
        {/* Nav links */}
        <div className="card anim-fade-up" style={{ overflow:"hidden", marginBottom:14 }}>
          {MENU_ITEMS.map(({ label, href }, idx) => (
            <Link key={href} href={href} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderBottom: idx < MENU_ITEMS.length - 1 ? "1px solid var(--border)" : "none", textDecoration:"none", color:"var(--text-1)", fontWeight:600, fontSize:"0.9rem", transition:"var(--transition)" }}>
              {label}
              <span style={{ color:"var(--text-3)", fontSize:"1rem" }}>›</span>
            </Link>
          ))}
        </div>

        {/* Theme switcher */}
        <div className="card anim-fade-up anim-s1" style={{ padding:"16px 18px", marginBottom:14 }}>
          <p style={{ fontWeight:700, fontSize:"0.84rem", marginBottom:12, color:"var(--text-2)" }}>🎨 Appearance</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
            {THEMES.map(({ key, icon, label }) => {
              const isActive = activeTheme === key;
              const isPremiumKey = key === "premium";
              const isChalkKey  = key === "chalk";
              return (
                <button
                  key={key}
                  onClick={() => applyTheme(key)}
                  style={{
                    padding:"12px 4px", borderRadius:"var(--radius-md)", cursor:"pointer",
                    fontFamily:"var(--font)", fontWeight:700, fontSize:"0.75rem",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                    border: isActive
                      ? isPremiumKey ? "1.5px solid #C9A227"
                      : isChalkKey  ? "1.5px solid #E85D04"
                      : "1.5px solid var(--orange)"
                      : "1.5px solid var(--border)",
                    background: isActive
                      ? isPremiumKey ? "rgba(201,162,39,0.12)"
                      : isChalkKey  ? "rgba(232,93,4,0.08)"
                      : "rgba(249,115,22,0.09)"
                      : "var(--bg-2)",
                    color: isActive
                      ? isPremiumKey ? "#C9A227"
                      : isChalkKey  ? "#E85D04"
                      : "var(--orange)"
                      : "var(--text-2)",
                    transition:"var(--transition)",
                  }}
                >
                  <span style={{ fontSize:"1.4rem" }}>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {activeTheme === "premium" && (
            <p className="anim-fade-up" style={{ fontSize:"0.72rem", color:"#C9A227", marginTop:10, textAlign:"center", letterSpacing:"0.04em" }}>
              👑 Premium Gold — exclusive for our finest guests
            </p>
          )}
          {activeTheme === "chalk" && (
            <p className="anim-fade-up" style={{ fontSize:"0.72rem", color:"#E85D04", marginTop:10, textAlign:"center" }}>
              🤍 Chalk — clean white look, perfect for bright environments
            </p>
          )}
        </div>

        {/* End session */}
        <button onClick={endSession} className="anim-fade-up anim-s2" style={{ width:"100%", padding:"15px", borderRadius:"var(--radius-lg)", background:"rgba(239,68,68,0.06)", border:"1.5px solid rgba(239,68,68,0.20)", color:"var(--red)", fontWeight:800, cursor:"pointer", fontFamily:"var(--font)", fontSize:"0.9rem", transition:"background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}>
          End Session
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
