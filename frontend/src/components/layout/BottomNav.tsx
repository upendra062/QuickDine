"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cartStore";

const NAV = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/menu", label: "Menu", icon: "🍽️" },
  { href: "/cart", label: "Cart", icon: "🛒", badge: true },
  { href: "/orders", label: "Orders", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());

  return (
    <nav className="bottom-nav">
      {NAV.map(({ href, label, icon, badge }) => (
        <Link key={href} href={href} className={`nav-item ${pathname.startsWith(href) ? "active" : ""}`}>
          <span style={{ position: "relative", fontSize: "1.3rem" }}>
            {icon}
            {badge && count > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -8,
                background: "var(--accent)", color: "#000",
                borderRadius: "99px", fontSize: "0.55rem", fontWeight: 800,
                padding: "1px 5px", minWidth: 16, textAlign: "center",
              }}>{count}</span>
            )}
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
