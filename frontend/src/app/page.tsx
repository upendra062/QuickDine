"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

function WelcomePage() {
  const router = useRouter();
  const params = useSearchParams();
  const tableId = Number(params.get("table") || "1");
  const setSession = useSession((s) => s.setSession);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [restName, setRestName] = useState("NOVA Eats");

  useEffect(() => {
    api.get("/api/settings").then((r) => { if (r.data.rest_name) setRestName(r.data.rest_name); }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { showToast("Please enter your name", "error"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/sessions", { name: name.trim(), phone: phone.trim() || null, table_id: tableId });
      sessionStorage.setItem("token", data.access_token);
      setSession({ name: data.name, phone: data.phone, tableId: data.table_id, token: data.access_token, isPremium: data.is_premium });
      router.push("/home");
    } catch {
      showToast("Could not start session. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
      <ToastContainer />
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "2rem" }}>
          {restName.split(" ")[0]}<span style={{ color: "var(--accent)" }}>{restName.split(" ").slice(1).join(" ")}</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>Table {tableId} · QR Verified</p>
      </div>
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: "32px 28px" }}>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem", marginBottom: 8 }}>
          Welcome to the<br /><span className="gradient-text">future of dining</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 24 }}>Enter your details to begin</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field-wrap">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 5 2 2 0 0 1 3 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input type="tel" placeholder="Phone (optional — earn rewards)" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Starting…" : "Let's Begin →"}
          </button>
        </form>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          {["🎙️ Voice Order", "⚡ Instant", "🏆 Rewards", "📍 Live Track"].map((f) => (
            <span key={f} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, color: "var(--text-muted)" }}>{f}</span>
          ))}
        </div>
      </div>
      <a href="/admin" style={{ marginTop: 20, color: "var(--text-muted)", fontSize: "0.78rem", textDecoration: "none" }}>Staff / Admin Login →</a>
    </div>
  );
}

export default function Page() {
  return <Suspense><WelcomePage /></Suspense>;
}
