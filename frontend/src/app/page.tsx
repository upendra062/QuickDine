"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const PARTICLES = ["🍛","🌶️","🍗","🧅","🍚","🫚","🍋","🌿","🧄","🫙","🍤","🥘"];
const FEATURES  = ["🎙️ Voice Order","⚡ Instant","🏆 Rewards","📍 Live Tracking","🎟️ Coupons","💳 Pay Online"];

function WelcomePage() {
  const router   = useRouter();
  const params   = useSearchParams();
  const tableId  = Number(params.get("table") || "1");
  const setSession = useSession((s) => s.setSession);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [restName, setRestName] = useState("Rasoi");
  const [tagline, setTagline]   = useState("Crafted with soul, served with pride");

  useEffect(() => {
    api.get("/api/settings").then((r) => {
      if (r.data.rest_name) setRestName(r.data.rest_name);
      if (r.data.tagline)   setTagline(r.data.tagline);
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
    } catch { showToast("Could not start session. Try again.", "error"); }
    finally   { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column", background:"var(--bg)", overflowX:"hidden" }}>
      <ToastContainer />

      {/* ── Hero ───────────────────────────────────────── */}
      <div style={{ position:"relative", height:"50dvh", flexShrink:0, overflow:"hidden",
        background:"linear-gradient(170deg,#1F0D04 0%,#321808 45%,#0E0603 100%)" }}>

        {/* Deep radial glows */}
        <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(249,115,22,0.16) 0%,transparent 65%)",
          pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-30%", right:"-10%",
          width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 65%)",
          pointerEvents:"none" }} />

        {/* Floating particles */}
        {PARTICLES.map((emoji, i) => (
          <span key={i} className="particle" style={{
            bottom: `${6 + (i % 5) * 10}%`,
            left:   `${(i * 9 + 2) % 94}%`,
            fontSize:`${0.8 + (i % 3) * 0.28}rem`,
            "--dur":  `${3.2 + (i % 5) * 1.1}s`,
            "--delay":`${i * 0.5}s`,
          } as React.CSSProperties}>{emoji}</span>
        ))}

        {/* Decorative horizontal lines */}
        <div style={{ position:"absolute", bottom:60, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(249,115,22,0.15),transparent)" }} />
        <div style={{ position:"absolute", bottom:40, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.08),transparent)" }} />

        {/* Centre content */}
        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", height:"100%", padding:"0 24px",
          textAlign:"center", gap:0 }}>

          {/* Logo mark */}
          <div className="anim-bounce-in" style={{
            width:88, height:88, borderRadius:26,
            background:"linear-gradient(145deg,#F97316,#F59E0B,#EA580C)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"2.4rem", marginBottom:18,
            boxShadow:"0 0 0 0 rgba(249,115,22,0.5), 0 12px 40px rgba(249,115,22,0.45)",
            animation:"bounceIn 0.6s ease both, glowPulse 2.8s ease-in-out 0.8s infinite",
            position:"relative",
          }}>🍛
            <div style={{ position:"absolute", inset:-4, borderRadius:30,
              border:"1px solid rgba(249,115,22,0.30)", pointerEvents:"none" }} />
          </div>

          <h1 className="anim-fade-up anim-s1" style={{
            fontFamily:"var(--font)", fontWeight:900, fontSize:"clamp(2.2rem,8vw,3rem)",
            color:"#fff", letterSpacing:"-0.03em", lineHeight:1,
            textShadow:"0 2px 20px rgba(0,0,0,0.5)",
          }}>{restName}</h1>

          <p className="anim-fade-up anim-s2" style={{
            color:"rgba(254,243,226,0.55)", fontSize:"0.86rem",
            fontStyle:"italic", marginTop:10, letterSpacing:"0.01em",
          }}>{tagline}</p>

          {/* Table badge */}
          <div className="anim-fade-up anim-s3" style={{ marginTop:20 }}>
            <span style={{
              fontSize:"0.73rem", padding:"6px 20px", borderRadius:99,
              background:"rgba(249,115,22,0.14)", border:"1px solid rgba(249,115,22,0.32)",
              color:"var(--orange)", fontWeight:700,
              display:"inline-flex", alignItems:"center", gap:7,
              boxShadow:"0 0 16px rgba(249,115,22,0.12)",
            }}>
              <span className="live-dot" />
              🪑 Table {tableId} · Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Form sheet ─────────────────────────────────── */}
      <div style={{
        flex:1, background:"var(--bg)", borderRadius:"32px 32px 0 0",
        marginTop:-30, padding:"28px 24px 48px",
        boxShadow:"0 -6px 40px rgba(0,0,0,0.5)",
        animation:"fadeInUp 0.45s ease both",
      }}>
        {/* Handle bar */}
        <div style={{ width:44, height:4, background:"var(--border)", borderRadius:99, margin:"0 auto 26px" }} />

        <div style={{ maxWidth:420, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.5rem", marginBottom:4 }}>
            Welcome in 👋
          </h2>
          <p style={{ color:"var(--text-2)", fontSize:"0.84rem", marginBottom:22 }}>
            Tell us your name to begin — takes 5 seconds.
          </p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {/* Name field */}
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text" placeholder="Your name *" value={name}
                onChange={(e) => setName(e.target.value)} required autoFocus
              />
            </div>

            {/* Phone field */}
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 5 2 2 0 0 1 3 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input
                type="tel" placeholder="Phone — optional, earn 🏆 rewards"
                value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric"
              />
            </div>

            {/* Rewards hint */}
            {phone.length >= 10 && (
              <div className="anim-fade-up" style={{
                padding:"10px 14px", borderRadius:"var(--radius-md)",
                background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)",
                fontSize:"0.78rem", color:"var(--green)", display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:"1rem" }}>🎉</span>
                Phone linked — you&apos;ll earn reward points on every order!
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:4 }}>
              {loading
                ? <><span style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}>⟳</span> Starting…</>
                : "Begin Dining →"}
            </button>
          </form>

          {/* Feature pills — scrolling */}
          <div className="marquee-wrap" style={{ marginTop:22, mask:"linear-gradient(90deg,transparent,black 15%,black 85%,transparent)" }}>
            <div className="marquee-inner">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <span key={i} style={{
                  display:"inline-block", marginRight:10, fontSize:"0.72rem",
                  padding:"5px 14px", background:"var(--bg-2)",
                  border:"1px solid var(--border)", borderRadius:99, color:"var(--text-3)",
                }}>{f}</span>
              ))}
            </div>
          </div>

          <a href="/admin" style={{
            display:"block", textAlign:"center", marginTop:22,
            color:"var(--text-3)", fontSize:"0.76rem", textDecoration:"none",
            transition:"color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--orange)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
            Staff Login →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Page() { return <Suspense><WelcomePage /></Suspense>; }
