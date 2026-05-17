"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/store/sessionStore";
import { useCart } from "@/store/cartStore";
import BottomNav from "@/components/layout/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const { name, phone, tableId, clear } = useSession();

  function endSession() {
    clear();
    useCart.getState().clear();
    sessionStorage.clear();
    router.push("/");
  }

  function toggleTheme() {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
  }

  const initials = name ? name.slice(0, 2).toUpperCase() : "GU";

  return (
    <div className="page">
      <div style={{ padding: "56px 20px 24px", textAlign: "center", background: "linear-gradient(135deg,rgba(99,102,241,0.08),transparent)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent-2))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.6rem", color: "#000" }}>{initials}</div>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.4rem" }}>{name || "Guest"}</h1>
        {phone && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{phone}</p>}
        <span style={{ fontSize: "0.75rem", padding: "4px 12px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, color: "var(--text-muted)" }}>Table {tableId}</span>
      </div>
      <div className="page-content">
        {[
          { label: "📋 My Orders", href: "/orders" },
          { label: "🏆 Rewards", href: "/rewards" },
          { label: "📍 Track Order", href: "/tracking" },
        ].map(({ label, href }) => (
          <Link key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", marginBottom: 10, borderRadius: "var(--radius-md)", background: "var(--glass)", border: "1px solid var(--glass-border)", textDecoration: "none", color: "var(--text-primary)", fontWeight: 600 }}>
            {label} <span style={{ color: "var(--text-muted)" }}>›</span>
          </Link>
        ))}
        <button onClick={toggleTheme} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", marginBottom: 10, borderRadius: "var(--radius-md)", background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>
          🎨 Toggle Theme <span style={{ color: "var(--text-muted)" }}>›</span>
        </button>
        <button onClick={endSession} style={{ width: "100%", padding: "14px", marginTop: 20, borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 700, cursor: "pointer" }}>
          End Session
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
