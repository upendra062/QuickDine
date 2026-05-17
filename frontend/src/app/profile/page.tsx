"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/store/sessionStore";
import { useCart } from "@/store/cartStore";
import BottomNav from "@/components/layout/BottomNav";

const MENU_ITEMS = [
  { label: "📋  My Orders",    href: "/orders" },
  { label: "🏆  Rewards",      href: "/rewards" },
  { label: "📍  Track Order",  href: "/tracking" },
];

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
      {/* Profile header */}
      <div style={{ padding: "52px 20px 24px", textAlign: "center", background: "linear-gradient(160deg,#1A0E06,var(--bg))", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,var(--orange),var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.7rem", color: "#fff", boxShadow: "0 6px 24px rgba(249,115,22,0.35)" }}>{initials}</div>
        <h1 style={{ fontFamily: "var(--font)", fontWeight: 900, fontSize: "1.4rem", marginBottom: 4 }}>{name || "Guest"}</h1>
        {phone && <p style={{ color: "var(--text-3)", fontSize: "0.84rem", marginBottom: 8 }}>{phone}</p>}
        <span style={{ fontSize: "0.74rem", padding: "4px 14px", background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.20)", borderRadius: 99, color: "var(--orange)", fontWeight: 700 }}>🪑 Table {tableId}</span>
      </div>

      <div className="page-content">
        {/* Nav links */}
        <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
          {MENU_ITEMS.map(({ label, href }, idx) => (
            <Link key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: idx < MENU_ITEMS.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", color: "var(--text-1)", fontWeight: 600, fontSize: "0.9rem", transition: "var(--transition)" }}>
              {label}
              <span style={{ color: "var(--text-3)", fontSize: "1rem" }}>›</span>
            </Link>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
          <button onClick={toggleTheme} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "transparent", border: "none", color: "var(--text-1)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", textAlign: "left", fontFamily: "var(--font)" }}>
            🎨  Toggle Theme
            <span style={{ color: "var(--text-3)", fontSize: "1rem" }}>›</span>
          </button>
        </div>

        <button onClick={endSession} style={{ width: "100%", padding: "15px", borderRadius: "var(--radius-lg)", background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.20)", color: "var(--red)", fontWeight: 800, cursor: "pointer", fontFamily: "var(--font)", fontSize: "0.9rem" }}>
          End Session
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
