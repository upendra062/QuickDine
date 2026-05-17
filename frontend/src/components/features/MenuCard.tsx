"use client";
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
}

export default function MenuCard({ item, premiumPrice }: Props) {
  const add = useCart((s) => s.add);
  const count = useCart((s) => s.items.find((i) => i.id === item.id)?.qty ?? 0);
  const updateQty = useCart((s) => s.updateQty);
  const { toggle, has } = useWishlist();
  const saved = has(item.id);
  const price = premiumPrice ?? item.price;

  return (
    <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Image */}
      <div style={{ position: "relative", height: 148 }}>
        <Image
          src={item.img_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"}
          alt={item.name} fill style={{ objectFit: "cover" }} unoptimized
        />
        {/* overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 50%)" }} />

        {/* tag */}
        {item.tag && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "var(--orange)", color: "#fff", borderRadius: 99, fontSize: "0.62rem", fontWeight: 800, padding: "3px 8px", letterSpacing: "0.02em" }}>{item.tag}</span>
        )}

        {/* wishlist */}
        <button onClick={() => toggle(item.id)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          {saved ? "❤️" : "🤍"}
        </button>

        {/* veg/nonveg dot */}
        <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderRadius: 3, background: item.is_veg ? "#22C55E" : "#EF4444", border: "2px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "11px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.2 }}>{item.name}</p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", lineHeight: 1.4, flex: 1 }}>{item.description}</p>

        {item.avg_rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: "0.68rem", color: "var(--amber)", fontWeight: 700 }}>★ {item.avg_rating}</span>
            <span style={{ fontSize: "0.64rem", color: "var(--text-3)" }}>({item.review_count})</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <div>
            <span style={{ fontFamily: "var(--font)", fontWeight: 800, color: "var(--orange)", fontSize: "1rem" }}>{fmt(price)}</span>
            {premiumPrice && <span style={{ fontSize: "0.68rem", color: "var(--text-3)", textDecoration: "line-through", marginLeft: 5 }}>{fmt(item.price)}</span>}
          </div>

          {count === 0 ? (
            <button
              onClick={() => { add({ id: item.id, name: item.name, price, img_url: item.img_url, is_veg: item.is_veg }); showToast(`${item.name} added`); }}
              style={{ padding: "6px 14px", background: "linear-gradient(135deg,var(--orange),var(--amber))", color: "#fff", border: "none", borderRadius: 99, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", boxShadow: "0 2px 10px rgba(249,115,22,0.30)" }}
            >
              + Add
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => updateQty(item.id, count - 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid var(--orange)", background: "transparent", color: "var(--orange)", cursor: "pointer", fontWeight: 800, fontSize: "1rem" }}>−</button>
              <span style={{ fontWeight: 800, minWidth: 18, textAlign: "center", fontSize: "0.9rem" }}>{count}</span>
              <button onClick={() => updateQty(item.id, count + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--orange)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: "1rem" }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
