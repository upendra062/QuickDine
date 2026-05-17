"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const PARTICLES = ["🍛","🌶️","🍗","🧅","🍚","🫚","🍋","🌿","🧄","🫙"];

function WelcomePage() {
  const router = useRouter();
  const params = useSearchParams();
  const tableId = Number(params.get("table") || "1");
  const setSession = useSession((s) => s.setSession);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [restName, setRestName] = useState("Rasoi");
  const [tagline, setTagline] = useState("Crafted with soul, served with pride");

  useEffect(() => {
    api.get("/api/settings").then((r) => {
      if (r.data.rest_name) setRestName(r.data.rest_name);
      if (r.data.tagline) setTagline(r.data.tagline);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { showToast("Please enter your name", "error"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/sessions", {
        name: name.trim(), phone: phone.trim() || null, table_id: tableId,
      });
      sessionStorage.setItem("token", data.access_token);
      setSession({ name: data.name, phone: data.phone, tableId: data.table_id, token: data.access_token, isPremium: data.is_premium });
      router.push("/home");
    } catch {
      showToast("Could not start session. Try again.", "error");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <ToastContainer />

      {/* Hero */}
      <div style={{ position: "relative", height: "46dvh", flexShrink: 0, overflow: "hidden", background: "linear-gradient(170deg,#1A0E06 0%,#2D1A08 55%,#100804 100%)" }}>

        {/* Animated particles */}
        {PARTICLES.map((emoji, i) => (
          <span key={i} className="particle" style={{
            bottom: `${8 + (i % 4) * 12}%`,
            left: `${(i * 10 + 3) % 96}%`,
            fontSize: `${0.85 + (i % 3) * 0.3}rem`,
            "--dur":   `${3.5 + (i % 4) * 1.2}s`,
            "--delay": `${i * 0.55}s`,
          } as React.CSSProperties}>{emoji}</span>
        ))}

        {/* Radial glows */}
        <div style={{ position:"absolute", top:-60, right:-60, width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-70, left:-50, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.13) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* Content */}
        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", padding:"0 24px", textAlign:"center" }}>
          {/* Animated logo */}
          <div className="anim-bounce-in" style={{ width:78, height:78, borderRadius:22, background:"linear-gradient(135deg,var(--orange),var(--amber))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.1rem", marginBottom:16, boxShadow:"0 8px 36px rgba(249,115,22,0.40)", position:"relative" }}>
            🍛
            <span style={{ position:"absolute", inset:-2, borderRadius:24, border:"1.5px solid rgba(249,115,22,0.35)", animation:"glowPulse 2.5s ease-in-out infinite" }} />
          </div>

          <h1 className="anim-fade-up anim-s1" style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"2.6rem", color:"var(--text-1)", letterSpacing:"-0.03em", lineHeight:1 }}>{restName}</h1>
          <p className="anim-fade-up anim-s2" style={{ color:"var(--text-2)", fontSize:"0.85rem", fontStyle:"italic", marginTop:8 }}>{tagline}</p>

          <div className="anim-fade-up anim-s3" style={{ marginTop:18 }}>
            <span style={{ fontSize:"0.72rem", padding:"5px 18px", borderRadius:99, background:"rgba(249,115,22,0.12)", border:"1px solid rgba(249,115,22,0.28)", color:"var(--orange)", fontWeight:700, display:"inline-flex", alignItems:"center", gap:6 }}>
              <span className="live-dot" />
              🪑 Table {tableId} · Scan Verified
            </span>
          </div>
        </div>
      </div>

      {/* Form sheet */}
      <div className="anim-fade-up" style={{ flex:1, background:"var(--bg)", borderRadius:"28px 28px 0 0", marginTop:-26, padding:"26px 24px 40px", boxShadow:"0 -4px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ width:40, height:4, background:"var(--border)", borderRadius:99, margin:"0 auto 22px" }} />
        <h2 style={{ fontFamily:"var(--font)", fontWeight:800, fontSize:"1.4rem", marginBottom:4 }}>Welcome in 👋</h2>
        <p style={{ color:"var(--text-2)", fontSize:"0.84rem", marginBottom:22 }}>Tell us your name to get started</p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <input type="text" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 5 2 2 0 0 1 3 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <input type="tel" placeholder="Phone (optional — earn rewards)" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:4 }}>
            {loading ? "Starting…" : "Begin Dining →"}
          </button>
        </form>

        {/* Feature pills */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20, flexWrap:"wrap" }}>
          {["🎙️ Voice Order","⚡ Instant","🏆 Rewards","📍 Live Tracking"].map((f) => (
            <span key={f} style={{ fontSize:"0.71rem", padding:"4px 12px", background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:99, color:"var(--text-3)" }}>{f}</span>
          ))}
        </div>

        <a href="/admin" style={{ display:"block", textAlign:"center", marginTop:24, color:"var(--text-3)", fontSize:"0.76rem", textDecoration:"none" }}>Staff Login →</a>
      </div>
    </div>
  );
}

export default function Page() { return <Suspense><WelcomePage /></Suspense>; }
