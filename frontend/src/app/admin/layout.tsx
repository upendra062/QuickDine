"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ToastContainer from "@/components/ui/Toast";

const NAV = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/orders", icon: "📦", label: "Orders" },
  { href: "/admin/kitchen", icon: "👨‍🍳", label: "Kitchen" },
  { href: "/admin/menu", icon: "🍽️", label: "Menu" },
  { href: "/admin/help", icon: "🆘", label: "Help" },
  { href: "/admin/coupons", icon: "🎟️", label: "Coupons" },
  { href: "/admin/rewards", icon: "🏆", label: "Rewards" },
  { href: "/admin/premium", icon: "⭐", label: "Premium" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin";

  useEffect(() => {
    if (!isLogin && !localStorage.getItem("admin_token")) router.push("/admin");
  }, [isLogin, router]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  }

  if (isLogin) return <>{children}<ToastContainer /></>;

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg)" }}>
      <ToastContainer />
      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 39 }} />}
      {/* Sidebar */}
      <aside style={{ position: "fixed", top: 0, left: open ? 0 : -260, width: 260, height: "100dvh", background: "var(--bg-2)", borderRight: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", zIndex: 40, transition: "left 0.3s ease", overflowY: "auto" }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--glass-border)" }}>
          <div style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.2rem" }}>QuickDine <span style={{ color: "#ef4444", fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", background: "rgba(239,68,68,0.1)", borderRadius: 99 }}>ADMIN</span></div>
        </div>
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(({ href, icon, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", color: pathname.startsWith(href) ? "var(--accent)" : "var(--text-secondary)", background: pathname.startsWith(href) ? "rgba(0,255,135,0.06)" : "transparent", borderLeft: pathname.startsWith(href) ? "3px solid var(--accent)" : "3px solid transparent", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, transition: "var(--transition)" }}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} style={{ margin: "0 16px 20px", padding: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-sm)", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Sign Out</button>
      </aside>
      {/* Main */}
      <div style={{ flex: 1, marginLeft: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(13,20,37,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--glass-border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.3rem" }}>☰</button>
          <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, fontSize: "1rem" }}>{NAV.find((n) => pathname.startsWith(n.href))?.label || "Admin"}</span>
        </header>
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
