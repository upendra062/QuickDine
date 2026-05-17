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
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/admin/login", { username, password });
      localStorage.setItem("admin_token", data.access_token);
      router.push("/admin/dashboard");
    } catch { showToast("Invalid credentials", "error"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
      <ToastContainer />
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: "40px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <span style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.4rem" }}>QuickDine</span>
          <span style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 99, fontSize: "0.7rem", fontWeight: 800, padding: "3px 10px" }}>ADMIN</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem", textAlign: "center", marginBottom: 6 }}>Welcome Back</h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "0.85rem", marginBottom: 24 }}>Sign in to the management panel</p>
        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={{ padding: "10px 14px", background: "rgba(0,255,135,0.05)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Demo: <strong style={{ color: "var(--accent)" }}>admin</strong> / <strong style={{ color: "var(--accent)" }}>nova123</strong>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Signing in…" : "Sign In →"}</button>
        </form>
      </div>
    </div>
  );
}
