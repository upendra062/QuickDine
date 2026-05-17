"use client";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { fmt } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface Props {
  item: {
    id: number; name: string; description: string; price: number;
    is_veg: boolean; tag?: string | null; img_url: string;
    avg_rating?: number | null; review_count?: number;
  };
  premiumPrice?: number | null;
  animDelay?: number;
}

export default function MenuCard({ item, premiumPrice, animDelay = 0 }: Props) {
  const add = useCart((s) => s.add);
  const count = useCart((s) => s.items.find((i) => i.id === item.id)?.qty ?? 0);
  const updateQty = useCart((s) => s.updateQty);
  const { toggle, has } = useWishlist();
  const saved = has(item.id);
  const price = premiumPrice ?? item.price;
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleAdd() {
    add({ id: item.id, name: item.name, price, img_url: item.img_url, is_veg: item.is_veg });
    showToast(`${item.name} added 🛒`);
    setAdding(true);
    setTimeout(() => setAdding(false), 600);
  }

  const TAG_COLORS: Record<string, string> = {
    "Bestseller":   "#F97316",
    "Chef Pick":    "#A855F7",
    "Spicy":        "#EF4444",
    "Premium":      "#C9A227",
    "House Special":"#22C55E",
    "New":          "#60A5FA",
    "Seasonal":     "#EC4899",
    "Must Try":     "#F59E0B",
    "Classic":      "#6B7280",
    "Best Value":   "#10B981",
    "Popular":      "#F97316",
    "Signature":    "#8B5CF6",
  };
  const tagColor = item.tag ? (TAG_COLORS[item.tag] || "var(--orange)") : "";

  return (
    <div
      className="anim-fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-3)", border: `1px solid ${hovered ? "rgba(249,115,22,0.28)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 14px 40px rgba(249,115,22,0.13)" : "none",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        animationDelay: `${animDelay}s`,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 148, overflow: "hidden" }}>
        <Image
          src={item.img_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"}
          alt={item.name} fill
          style={{ objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s ease" }}
          unoptimized
        />
        {/* gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.60) 0%,transparent 55%)" }} />

        {/* tag */}
        {item.tag && (
          <span style={{ position: "absolute", top: 8, left: 8, background: tagColor, color: "#fff", borderRadius: 99, fontSize: "0.60rem", fontWeight: 800, padding: "3px 9px", letterSpacing: "0.03em", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{item.tag}</span>
        )}

        {/* wishlist */}
        <button
          onClick={() => toggle(item.id)}
          style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.50)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "transform 0.15s", transform: saved ? "scale(1.15)" : "scale(1)" }}
        >{saved ? "❤️" : "🤍"}</button>

        {/* veg/nonveg indicator */}
        <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderRadius: 3, background: item.is_veg ? "#22C55E" : "#EF4444", border: "2px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
        </div>

        {/* rating overlay */}
        {item.avg_rating && (
          <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.60)", borderRadius: 99, padding: "2px 8px", display: "flex", alignItems: "center", gap: 3, backdropFilter: "blur(4px)" }}>
            <span style={{ color: "#FBBF24", fontSize: "0.65rem" }}>★</span>
            <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>{item.avg_rating}</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.60rem" }}>({item.review_count})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "11px 12px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <p style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.2 }}>{item.name}</p>
        <p style={{ fontSize: "0.71rem", color: "var(--text-3)", lineHeight: 1.4, flex: 1 }}>{item.description}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div>
            <span style={{ fontFamily: "var(--font)", fontWeight: 800, color: "var(--orange)", fontSize: "1rem" }}>{fmt(price)}</span>
            {premiumPrice && <span style={{ fontSize: "0.68rem", color: "var(--text-3)", textDecoration: "line-through", marginLeft: 5 }}>{fmt(item.price)}</span>}
          </div>

          {count === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                padding: "6px 16px", background: adding ? "var(--green)" : "linear-gradient(135deg,var(--orange),var(--amber))",
                color: "#fff", border: "none", borderRadius: 99, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer",
                boxShadow: `0 2px 12px ${adding ? "rgba(34,197,94,0.4)" : "rgba(249,115,22,0.32)"}`,
                transform: adding ? "scale(1.12)" : "scale(1)",
                transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              }}
            >{adding ? "✓" : "+ Add"}</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => updateQty(item.id, count - 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid var(--orange)", background: "transparent", color: "var(--orange)", cursor: "pointer", fontWeight: 800, fontSize: "1rem" }}>−</button>
              <span style={{ fontWeight: 800, minWidth: 18, textAlign: "center", fontSize: "0.9rem", color: "var(--orange)" }}>{count}</span>
              <button onClick={() => updateQty(item.id, count + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--orange)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: "1rem" }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
