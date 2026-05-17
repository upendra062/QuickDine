"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import MenuCard from "@/components/features/MenuCard";
import ToastContainer from "@/components/ui/Toast";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";

interface Category { id: string; name: string; emoji: string; }
interface MenuItem  { id: number; cat_id: string; name: string; description: string; price: number; is_veg: boolean; tag?: string | null; img_url: string; avg_rating?: number; review_count?: number; available: boolean; }

export default function MenuPage() {
  const router = useRouter();
  const { isPremium, phone } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [premiumPricing, setPremiumPricing] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    api.get("/api/menu").then((r) => { setCategories(r.data.categories); setItems(r.data.items); setLoading(false); }).catch(() => setLoading(false));
    if (isPremium && phone) api.get("/api/admin/premium/pricing").then((r) => setPremiumPricing(r.data)).catch(() => {});
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

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "14px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-1)", fontSize: "1rem" }}>←</button>
          <span style={{ fontFamily: "var(--font)", fontWeight: 800, fontSize: "1.3rem", flex: 1 }}>Our Menu</span>
          {isPremium && <span className="badge">⭐ Premium</span>}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "var(--text-3)" }}>🔍</span>
          <input
            type="text" placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", background: "var(--bg-2)", border: "1.5px solid var(--border)", borderRadius: 99, color: "var(--text-1)", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font)" }}
          />
        </div>

        {/* Filters */}
        <div className="chips-row">
          {[{ id: "all", label: "All" }, { id: "veg", label: "🟢 Veg" }, { id: "nonveg", label: "🔴 Non-Veg" }].map((f) => (
            <button key={f.id} className={`chip${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</button>
          ))}
          <div style={{ width: 1, background: "var(--border)", margin: "0 4px", flexShrink: 0 }} />
          <button className={`chip${activeCat === "all" ? " active" : ""}`} onClick={() => setActiveCat("all")}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip${activeCat === c.id ? " active" : ""}`} onClick={() => setActiveCat(c.id)}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-3)" }}>Loading menu…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((item) => <MenuCard key={item.id} item={item} premiumPrice={premiumPricing[item.id] ?? null} />)}
            {filtered.length === 0 && <p style={{ color: "var(--text-3)", gridColumn: "span 2", textAlign: "center", paddingTop: 40 }}>No dishes found</p>}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
