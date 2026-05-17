"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ToastContainer from "@/components/ui/Toast";

const NAV = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/orders",    icon: "📦", label: "Orders" },
  { href: "/admin/kitchen",   icon: "👨‍🍳", label: "Kitchen" },
  { href: "/admin/menu",      icon: "🍽️",  label: "Menu" },
  { href: "/admin/help",      icon: "🆘",  label: "Help" },
  { href: "/admin/coupons",   icon: "🎟️",  label: "Coupons" },
  { href: "/admin/rewards",   icon: "🏆",  label: "Rewards" },
  { href: "/admin/premium",   icon: "⭐",  label: "Premium" },
  { href: "/admin/analytics", icon: "📈",  label: "Analytics" },
  { href: "/admin/settings",  icon: "⚙️",  label: "Settings" },
];

const SIDEBAR_W = 256;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const isLogin  = pathname === "/admin";

  // open = false initially; set to true on desktop once measured
  const [open, setOpen]           = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function check() {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      // auto-open on desktop, auto-close on resize to mobile
      setOpen(desktop);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isLogin && !localStorage.getItem("admin_token")) router.push("/admin");
  }, [isLogin, router]);

  // Close sidebar when navigating on mobile
  function handleNavClick() {
    if (!isDesktop) setOpen(false);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  }

  if (isLogin) return <>{children}<ToastContainer /></>;

  const sidebarVisible = open;

  return (
    <div style={{ display:"flex", minHeight:"100dvh", background:"var(--bg)" }}>
      <ToastContainer />

      {/* Mobile overlay — tap to close */}
      {sidebarVisible && !isDesktop && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:39,
            backdropFilter:"blur(2px)", animation:"fadeIn 0.2s ease" }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top:0, left: sidebarVisible ? 0 : -SIDEBAR_W,
        width: SIDEBAR_W, height:"100dvh",
        background:"var(--bg-2)", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        zIndex:40, transition:"left 0.28s cubic-bezier(0.4,0,0.2,1)",
        overflowY:"auto", overflowX:"hidden",
      }}>
        {/* Brand */}
        <div style={{ padding:"22px 20px 16px", borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9,
              background:"linear-gradient(135deg,var(--orange),var(--amber))",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" }}>🍛</div>
            <div>
              <div style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1rem", lineHeight:1 }}>Rasoi</div>
              <span style={{ fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.08em",
                color:"#ef4444", background:"rgba(239,68,68,0.1)",
                padding:"1px 6px", borderRadius:99 }}>ADMIN</span>
            </div>
          </div>
          {/* Close button — visible always so user can hide sidebar */}
          <button
            onClick={() => setOpen(false)}
            style={{ background:"none", border:"none", cursor:"pointer",
              color:"var(--text-3)", fontSize:"1.1rem", padding:4,
              borderRadius:8, lineHeight:1 }}
            title="Close sidebar"
          >✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 10px" }}>
          {NAV.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href} href={href} onClick={handleNavClick}
                style={{
                  display:"flex", alignItems:"center", gap:11,
                  padding:"10px 12px", marginBottom:2,
                  color: active ? "var(--orange)" : "var(--text-2)",
                  background: active ? "rgba(249,115,22,0.10)" : "transparent",
                  borderRadius:"var(--radius-sm)",
                  border: active ? "1px solid rgba(249,115,22,0.18)" : "1px solid transparent",
                  textDecoration:"none", fontSize:"0.87rem", fontWeight: active ? 700 : 600,
                  transition:"var(--transition)",
                }}
              >
                <span style={{ fontSize:"1rem", width:20, textAlign:"center" }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"var(--orange)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding:"12px 10px 20px" }}>
          <button
            onClick={logout}
            style={{ width:"100%", padding:"10px 12px",
              background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)",
              borderRadius:"var(--radius-sm)", color:"#ef4444",
              fontWeight:700, cursor:"pointer", fontSize:"0.84rem",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              fontFamily:"var(--font)", transition:"background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.13)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex:1,
        marginLeft: isDesktop && sidebarVisible ? SIDEBAR_W : 0,
        display:"flex", flexDirection:"column", minWidth:0,
        transition:"margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Top bar */}
        <header style={{
          position:"sticky", top:0, zIndex:30,
          background:"var(--bg)", borderBottom:"1px solid var(--border)",
          padding:"14px 20px", display:"flex", alignItems:"center", gap:12,
        }}>
          {/* ☰ always toggles */}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ background:"var(--bg-2)", border:"1px solid var(--border)",
              borderRadius:"var(--radius-sm)", width:36, height:36,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", color:"var(--text-1)", fontSize:"1rem",
              transition:"var(--transition)", flexShrink:0 }}
            title={open ? "Close sidebar" : "Open sidebar"}
          >
            {open ? "✕" : "☰"}
          </button>
          <span style={{ fontFamily:"var(--font)", fontWeight:800, fontSize:"1rem", flex:1 }}>
            {NAV.find((n) => pathname.startsWith(n.href))?.label || "Admin"}
          </span>
          <span style={{ fontSize:"0.7rem", color:"var(--text-3)", fontWeight:600 }}>
            Rasoi Admin
          </span>
        </header>

        <main style={{ flex:1, padding:"20px", overflowY:"auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
