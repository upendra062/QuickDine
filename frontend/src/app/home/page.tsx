"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { fmt } from "@/lib/utils";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/ui/Toast";

const ACTIONS = [
  { href: "/menu",     icon: "🍽️", label: "Order Food",   bg: "linear-gradient(135deg,#F97316,#F59E0B)" },
  { href: "/voice",    icon: "🎙️", label: "Voice Order",  bg: "linear-gradient(135deg,#A855F7,#EC4899)" },
  { href: "/help",     icon: "🆘", label: "Get Help",     bg: "linear-gradient(135deg,#EF4444,#F97316)" },
  { href: "/rewards",  icon: "🏆", label: "Rewards",      bg: "linear-gradient(135deg,#F59E0B,#EAB308)" },
  { href: "/orders",   icon: "📋", label: "My Orders",    bg: "linear-gradient(135deg,#6366F1,#A855F7)" },
  { href: "/tracking", icon: "📍", label: "Track Order",  bg: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

interface FeaturedItem { id: number; name: string; price: number; img_url: string; tag: string; description: string; }

export default function HomePage() {
  const router = useRouter();
  const { name, tableId } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [featIdx, setFeatIdx] = useState(0);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    api.get("/api/settings").then((r) => setSettings(r.data)).catch(() => {});
    api.get("/api/menu").then((r) => {
      const items: FeaturedItem[] = (r.data.categories || []).flatMap((c: { items: FeaturedItem[] }) => c.items).filter((i: FeaturedItem) => i.tag);
      setFeatured(items.slice(0, 6));
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setFeatIdx((i) => (i + 1) % featured.length), 4500);
    return () => clearInterval(t);
  }, [featured]);

  const hero = featured[featIdx];

  return (
    <div className="page">
      <ToastContainer />

      {/* Header */}
      <div style={{ padding:"52px 20px 20px", background:"linear-gradient(160deg,#1A0E06,var(--bg))", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.14) 0%,transparent 70%)", pointerEvents:"none" }} />
        <p className="anim-fade-up" style={{ color:"var(--text-2)", fontSize:"0.82rem", marginBottom:2 }}>{greeting},</p>
        <h1 className="anim-fade-up anim-s1" style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.9rem", letterSpacing:"-0.02em" }}>{name || "Guest"} 👋</h1>
        <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
          <span className="anim-fade-up anim-s2" style={{ fontSize:"0.74rem", padding:"4px 12px", background:"rgba(249,115,22,0.12)", border:"1px solid rgba(249,115,22,0.22)", borderRadius:99, color:"var(--orange)", fontWeight:700 }}>🪑 Table {tableId}</span>
          <span className="anim-fade-up anim-s3" style={{ padding:"4px 12px", background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:99, color:"var(--text-2)", fontWeight:600, fontSize:"0.74rem", display:"inline-flex", alignItems:"center", gap:5 }}>
            <span className="live-dot" />{settings.rest_name || "Rasoi"}
          </span>
        </div>
      </div>

      <div className="page-content">

        {/* ── Today's Highlight (rotating featured) ── */}
        {hero && (
          <div key={featIdx} className="anim-scale-in glow-card" style={{ borderRadius:"var(--radius-xl)", overflow:"hidden", marginBottom:18, position:"relative", cursor:"pointer" }} onClick={() => router.push("/menu")}>
            <div style={{ position:"relative", height:150 }}>
              <img src={hero.img_url} alt={hero.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(11,9,7,0.85) 35%,transparent)" }} />
              <div style={{ position:"absolute", inset:0, padding:"18px 20px", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <span style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.1em", color:"var(--orange)", textTransform:"uppercase", marginBottom:4 }}>✨ Today's Highlight</span>
                <h3 style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.2rem", color:"#fff", marginBottom:4, lineHeight:1.1 }}>{hero.name}</h3>
                <p style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.65)", marginBottom:8, lineHeight:1.3 }}>{hero.description?.slice(0, 60)}…</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.1rem", color:"var(--amber)" }}>{fmt(hero.price)}</span>
                  {hero.tag && <span style={{ fontSize:"0.62rem", fontWeight:700, padding:"2px 10px", background:"rgba(249,115,22,0.85)", borderRadius:99, color:"#fff" }}>{hero.tag}</span>}
                </div>
              </div>
            </div>
            {/* dot indicators */}
            {featured.length > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:5, padding:"8px 0", background:"var(--bg-3)" }}>
                {featured.map((_,i) => (
                  <span key={i} onClick={(e) => { e.stopPropagation(); setFeatIdx(i); }} style={{ width: i === featIdx ? 16 : 6, height:6, borderRadius:99, background: i === featIdx ? "var(--orange)" : "var(--border)", cursor:"pointer", transition:"width 0.3s ease, background 0.3s ease" }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Action grid ── */}
        <p style={{ fontFamily:"var(--font)", fontWeight:700, fontSize:"0.76rem", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-3)", marginBottom:12 }}>What can we do for you?</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:22 }}>
          {ACTIONS.map(({ href, icon, label, bg }, idx) => (
            <Link key={href} href={href} className={`anim-fade-up anim-s${idx + 1}`} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"18px 8px", borderRadius:"var(--radius-lg)", textDecoration:"none", background:"var(--bg-3)", border:"1px solid var(--border)", transition:"transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(249,115,22,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; }}>
              <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", background:bg, boxShadow:"0 4px 16px rgba(0,0,0,0.3)", transition:"transform 0.2s ease" }}>{icon}</div>
              <span style={{ fontSize:"0.67rem", fontWeight:700, color:"var(--text-2)", textAlign:"center", lineHeight:1.2 }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Pro tip ── */}
        <div className="anim-fade-up anim-s6" style={{ background:"linear-gradient(135deg,rgba(249,115,22,0.08),rgba(245,158,11,0.05))", border:"1px solid rgba(249,115,22,0.16)", borderRadius:"var(--radius-lg)", padding:"16px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"rgba(249,115,22,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>💡</div>
          <div>
            <p style={{ fontFamily:"var(--font)", fontWeight:700, fontSize:"0.88rem", marginBottom:4 }}>Pro tip</p>
            <p style={{ fontSize:"0.80rem", color:"var(--text-2)", lineHeight:1.5 }}>Use <strong style={{ color:"var(--orange)" }}>Voice Order</strong> for the fastest experience. Earn {settings.points_per_rupee || 1} pt per ₹1 spent!</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
