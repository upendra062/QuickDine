"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cartStore";

const NAV = [
  { href: "/home",    label: "Home",    icon: "🏠" },
  { href: "/menu",    label: "Menu",    icon: "🍽️" },
  { href: "/cart",    label: "Cart",    icon: "🛒", badge: true },
  { href: "/orders",  label: "Orders",  icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());

  return (
    <nav className="bottom-nav">
      {NAV.map(({ href, label, icon, badge }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`nav-item${active ? " active" : ""}`}>
            <span style={{ position: "relative", fontSize: "1.3rem", lineHeight: 1 }}>
              {icon}
              {badge && count > 0 && (
                <span style={{ position: "absolute", top: -5, right: -8, background: "var(--orange)", color: "#fff", borderRadius: 99, fontSize: "0.52rem", fontWeight: 900, padding: "1px 5px", minWidth: 16, textAlign: "center", lineHeight: "14px" }}>{count}</span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
