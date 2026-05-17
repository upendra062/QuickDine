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
    <div style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ position: "relative", height: 140 }}>
        <Image src={item.img_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"} alt={item.name} fill style={{ objectFit: "cover" }} unoptimized />
        {item.tag && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "var(--accent)", color: "#000", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800, padding: "3px 8px" }}>{item.tag}</span>
        )}
        <button onClick={() => toggle(item.id)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {saved ? "❤️" : "🤍"}
        </button>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.is_veg ? "#00ff87" : "#ef4444", display: "inline-block", border: "1px solid currentColor" }} />
          <span style={{ fontFamily: "var(--font-main)", fontWeight: 700, fontSize: "0.9rem" }}>{item.name}</span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.4 }}>{item.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, color: "var(--accent)" }}>{fmt(price)}</span>
            {premiumPrice && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 6 }}>{fmt(item.price)}</span>}
            {item.avg_rating && <div style={{ fontSize: "0.7rem", color: "#f59e0b" }}>⭐ {item.avg_rating} ({item.review_count})</div>}
          </div>
          {count === 0 ? (
            <button onClick={() => { add({ id: item.id, name: item.name, price, img_url: item.img_url, is_veg: item.is_veg }); showToast(`${item.name} added`); }}
              style={{ padding: "6px 16px", background: "var(--accent)", color: "#000", border: "none", borderRadius: 99, fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>
              + Add
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateQty(item.id, count - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", cursor: "pointer", fontWeight: 800 }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{count}</span>
              <button onClick={() => updateQty(item.id, count + 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", border: "none", color: "#000", cursor: "pointer", fontWeight: 800 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
