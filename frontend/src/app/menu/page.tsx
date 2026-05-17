"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import MenuCard from "@/components/features/MenuCard";
import ToastContainer from "@/components/ui/Toast";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";

interface Category { id: string; name: string; emoji: string; }
interface MenuItem { id: number; cat_id: string; name: string; description: string; price: number; is_veg: boolean; tag?: string | null; img_url: string; avg_rating?: number; review_count?: number; available: boolean; }

export default function MenuPage() {
  const router = useRouter();
  const { isPremium, phone } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [premiumPricing, setPremiumPricing] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    api.get("/api/menu").then((r) => {
      setCategories(r.data.categories);
      setItems(r.data.items);
      setLoading(false);
    }).catch(() => setLoading(false));

    if (isPremium && phone) {
      api.get("/api/admin/premium/pricing").then((r) => setPremiumPricing(r.data)).catch(() => {});
    }
  }, [router, isPremium, phone]);

  const filtered = useMemo(() => items.filter((i) => {
    if (!i.available) return false;
    if (filter === "veg" && !i.is_veg) return false;
    if (filter === "nonveg" && i.is_veg) return false;
    if (activeCat !== "all" && i.cat_id !== activeCat) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, filter, activeCat, search]);

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(9,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--glass-border)", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
          <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, fontSize: "1.3rem", flex: 1 }}>Menu</span>
          {isPremium && <span className="badge">⭐ Premium</span>}
        </div>
        <input
          type="text" placeholder="🔍 Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, color: "var(--text-primary)", fontSize: "0.85rem", outline: "none", marginBottom: 10 }}
        />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {[{ id: "all", label: "All" }, { id: "veg", label: "🟢 Veg" }, { id: "nonveg", label: "🔴 Non-Veg" }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 99, border: "1px solid var(--glass-border)", background: filter === f.id ? "var(--accent)" : "var(--glass)", color: filter === f.id ? "#000" : "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--glass-border)", margin: "0 4px" }} />
          {[{ id: "all", label: "All" }, ...categories].map((c) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 99, border: "1px solid var(--glass-border)", background: activeCat === c.id ? "rgba(0,255,135,0.1)" : "var(--glass)", color: activeCat === c.id ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
              {"emoji" in c ? `${(c as Category).emoji} ${c.name}` : "All"}
            </button>
          ))}
        </div>
      </div>
      <div className="page-content" style={{ paddingTop: 16 }}>
        {loading ? <p style={{ color: "var(--text-muted)", textAlign: "center", paddingTop: 40 }}>Loading menu…</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} premiumPrice={premiumPricing[item.id] ?? null} />
            ))}
            {filtered.length === 0 && <p style={{ color: "var(--text-muted)", gridColumn: "span 2", textAlign: "center", paddingTop: 40 }}>No items found</p>}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
