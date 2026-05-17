"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/admin/login", { username, password });
      localStorage.setItem("admin_token", data.access_token);
      router.push("/admin/dashboard");
    } catch {
      showToast("Invalid credentials", "error");
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:24, position:"relative", overflow:"hidden",
    }}>
      <ToastContainer />

      {/* Background glow */}
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)",
        width:500, height:500, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 65%)",
        pointerEvents:"none" }} />

      <div className="anim-fade-up" style={{
        width:"100%", maxWidth:420,
        background:"var(--bg-2)", border:"1px solid var(--border)",
        borderRadius:"var(--radius-xl)", padding:"40px 36px",
        boxShadow:"0 24px 60px rgba(0,0,0,0.6)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:30 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:"linear-gradient(135deg,#1a0a0a,#2d1010)",
            border:"1.5px solid rgba(239,68,68,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.8rem", marginBottom:14,
            boxShadow:"0 8px 28px rgba(239,68,68,0.2)",
          }}>🔐</div>
          <h1 style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.5rem", marginBottom:4 }}>
            Admin Panel
          </h1>
          <span style={{
            background:"rgba(239,68,68,0.12)", color:"#ef4444",
            border:"1px solid rgba(239,68,68,0.25)", borderRadius:99,
            fontSize:"0.65rem", fontWeight:800, padding:"3px 12px", letterSpacing:"0.08em",
          }}>RASOI MANAGEMENT</span>
        </div>

        <form onSubmit={login} style={{ display:"flex", flexDirection:"column", gap:13 }}>
          {/* Username */}
          <div>
            <label style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-3)", display:"block", marginBottom:6 }}>
              USERNAME
            </label>
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text" placeholder="admin" value={username}
                onChange={(e) => setUsername(e.target.value)} required autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-3)", display:"block", marginBottom:6 }}>
              PASSWORD
            </label>
            <div className="field-wrap" style={{ position:"relative" }}>
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPw ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
                style={{ paddingRight:44 }}
              />
              <button
                type="button" onClick={() => setShowPw((p) => !p)}
                style={{ position:"absolute", right:12, background:"none", border:"none",
                  cursor:"pointer", color:"var(--text-3)", fontSize:"0.9rem", padding:4 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Credentials hint */}
          <div style={{
            padding:"10px 14px", borderRadius:"var(--radius-md)",
            background:"rgba(249,115,22,0.06)", border:"1px solid rgba(249,115,22,0.15)",
            fontSize:"0.78rem", color:"var(--text-3)",
          }}>
            Default: <strong style={{ color:"var(--orange)", fontFamily:"monospace" }}>admin</strong>
            {" / "}
            <strong style={{ color:"var(--orange)", fontFamily:"monospace" }}>Admin@2025</strong>
          </div>

          <button
            type="submit" className="btn-primary" disabled={loading}
            style={{ marginTop:4, background:"linear-gradient(135deg,#dc2626,#ef4444)" }}>
            {loading
              ? <><span style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}>⟳</span> Signing in…</>
              : "Sign In →"}
          </button>
        </form>

        <a href="/" style={{
          display:"block", textAlign:"center", marginTop:20,
          color:"var(--text-3)", fontSize:"0.76rem", textDecoration:"none",
        }}>← Back to restaurant</a>
      </div>
    </div>
  );
}
