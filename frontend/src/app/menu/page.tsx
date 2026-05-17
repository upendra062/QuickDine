"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import MenuCard from "@/components/features/MenuCard";
import ToastContainer from "@/components/ui/Toast";
import api from "@/lib/api";
import { useSession } from "@/store/sessionStore";

interface Category { id: string; name: string; emoji: string; color: string; }
interface MenuItem  {
  id: number; cat_id: string; name: string; description: string;
  price: number; is_veg: boolean; tag?: string | null;
  img_url: string; avg_rating?: number; review_count?: number; available: boolean;
}

function SkeletonCard() {
  return (
    <div style={{ background:"var(--bg-3)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden" }}>
      <div className="skeleton skeleton-img" style={{ height:148 }} />
      <div style={{ padding:"11px 12px 13px" }}>
        <div className="skeleton skeleton-text" style={{ width:"70%", marginBottom:6 }} />
        <div className="skeleton skeleton-text" style={{ width:"90%", marginBottom:6 }} />
        <div className="skeleton skeleton-text" style={{ width:"40%" }} />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const router = useRouter();
  const { isPremium, phone } = useSession();
  const [categories, setCategories]       = useState<Category[]>([]);
  const [items, setItems]                 = useState<MenuItem[]>([]);
  const [premiumPricing, setPremiumPricing] = useState<Record<number, number>>({});
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "veg" | "nonveg">("all");
  const [activeCat, setActiveCat] = useState("all");
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

  const isBarActive   = activeCat === "bar";
  const showGrouped   = activeCat === "all" && !search;
  const barCat        = categories.find((c) => c.id === "bar");

  return (
    <div className="page">
      <ToastContainer />

      {/* ── Sticky header ── */}
      <div style={{ position:"sticky", top:0, zIndex:40, background:"var(--bg)", borderBottom:"1px solid var(--border)", padding:"14px 18px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <button onClick={() => router.back()} style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-1)", fontSize:"1rem" }}>←</button>
          <span style={{ fontFamily:"var(--font)", fontWeight:800, fontSize:"1.3rem", flex:1 }}>Our Menu</span>
          {isPremium && <span className="badge">⭐ Premium</span>}
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:"0.9rem", color:"var(--text-3)" }}>🔍</span>
          <input
            type="text" placeholder="Search dishes…" value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCat("all"); }}
            style={{ width:"100%", padding:"10px 16px 10px 40px", background:"var(--bg-2)", border:"1.5px solid var(--border)", borderRadius:99, color:"var(--text-1)", fontSize:"0.85rem", outline:"none", fontFamily:"var(--font)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", fontSize:"1rem" }}>✕</button>
          )}
        </div>

        {/* Filters + categories */}
        <div className="chips-row">
          {[{ id:"all", label:"All" }, { id:"veg", label:"🟢 Veg" }, { id:"nonveg", label:"🔴 Non-Veg" }].map((f) => (
            <button key={f.id} className={`chip${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</button>
          ))}
          <div style={{ width:1, background:"var(--border)", margin:"0 4px", flexShrink:0 }} />
          <button className={`chip${activeCat === "all" ? " active" : ""}`} onClick={() => setActiveCat("all")}>All</button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip${activeCat === c.id ? " active" : ""}`}
              onClick={() => setActiveCat(c.id)}
              style={activeCat === c.id && c.id === "bar" ? { background:"#7C3AED", borderColor:"#7C3AED" } : {}}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ paddingTop:16 }}>

        {/* ── Bar banner (18+ notice) ── */}
        {(isBarActive || (showGrouped && barCat)) && (
          <div className="anim-fade-up" style={{
            borderRadius:"var(--radius-xl)", overflow:"hidden", marginBottom:20, position:"relative",
            background:"linear-gradient(135deg,#0f0720 0%,#1e0d40 50%,#0d1a2e 100%)",
            border:"1px solid rgba(124,58,237,0.30)", padding:"20px 20px 16px",
          }}>
            {/* Glow blobs */}
            <div style={{ position:"absolute", top:-40, right:-20, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-30, left:10, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,162,39,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:"1.6rem" }}>🍷</span>
                <div>
                  <h3 style={{ fontFamily:"var(--font)", fontWeight:900, fontSize:"1.1rem", color:"#fff", marginBottom:2 }}>Premium Bar</h3>
                  <span style={{ fontSize:"0.62rem", fontWeight:800, letterSpacing:"0.08em", color:"#C9A227", background:"rgba(201,162,39,0.15)", padding:"2px 10px", borderRadius:99, border:"1px solid rgba(201,162,39,0.25)" }}>CURATED SELECTION</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {["🍺 Craft Beers", "🍷 Wines", "🥃 Single Malts", "🍸 Cocktails"].map((t) => (
                  <span key={t} style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.07)", padding:"3px 12px", borderRadius:99, border:"1px solid rgba(255,255,255,0.10)" }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize:"0.70rem", color:"rgba(255,255,255,0.35)", marginTop:10 }}>
                🔞 Please drink responsibly · Must be 18+ to order · Do not drink and drive
              </p>
            </div>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : showGrouped ? (
          /* ── Grouped by category ── */
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            {categories.map((cat) => {
              const catItems = filtered.filter((i) => i.cat_id === cat.id);
              if (!catItems.length) return null;
              const isBar = cat.id === "bar";
              return (
                <section key={cat.id}>
                  {/* Section header */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:`${cat.color}22`, border:`1px solid ${cat.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{cat.emoji}</div>
                    <div style={{ flex:1 }}>
                      <h2 style={{ fontFamily:"var(--font)", fontWeight:800, fontSize:"1rem", color:"var(--text-1)", lineHeight:1 }}>{cat.name}</h2>
                      <p style={{ fontSize:"0.70rem", color:"var(--text-3)", marginTop:2 }}>{catItems.length} item{catItems.length !== 1 ? "s" : ""}{isBar ? " · 18+ only" : ""}</p>
                    </div>
                    <button onClick={() => setActiveCat(cat.id)} style={{ fontSize:"0.72rem", color:cat.id === "bar" ? "#7C3AED" : "var(--orange)", fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}>See all →</button>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {catItems.slice(0, 4).map((item, idx) => (
                      <MenuCard
                        key={item.id} item={item}
                        premiumPrice={premiumPricing[item.id] ?? null}
                        animDelay={idx * 0.06}
                      />
                    ))}
                  </div>

                  {catItems.length > 4 && (
                    <button onClick={() => setActiveCat(cat.id)} style={{ width:"100%", marginTop:10, padding:"11px", background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)", color:"var(--text-2)", fontSize:"0.82rem", fontWeight:700, cursor:"pointer", fontFamily:"var(--font)" }}>
                      +{catItems.length - 4} more in {cat.name}
                    </button>
                  )}
                </section>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", paddingTop:60 }}>
                <p style={{ fontSize:"2rem", marginBottom:12 }}>🍽️</p>
                <p style={{ color:"var(--text-3)", fontWeight:600 }}>No dishes found</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Single category / search grid ── */
          <div>
            {/* Bar sub-header when bar is filtered */}
            {isBarActive && (
              <p style={{ fontSize:"0.74rem", color:"rgba(124,58,237,0.7)", fontWeight:700, marginBottom:14, letterSpacing:"0.04em" }}>
                🥃 {filtered.length} premium beverages · 18+ only
              </p>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {filtered.map((item, idx) => (
                <MenuCard key={item.id} item={item} premiumPrice={premiumPricing[item.id] ?? null} animDelay={idx * 0.05} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn:"span 2", textAlign:"center", paddingTop:40 }}>
                  <p style={{ fontSize:"2rem", marginBottom:12 }}>🔍</p>
                  <p style={{ color:"var(--text-3)" }}>Nothing found for &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
