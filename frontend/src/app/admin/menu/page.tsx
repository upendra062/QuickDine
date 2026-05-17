"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface Category { id: string; name: string; emoji: string; }
interface MenuItem { id: number; cat_id: string; name: string; description: string; price: number; is_veg: boolean; tag?: string | null; img_url: string; available: boolean; }

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    api.get("/api/admin/menu/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get("/api/admin/menu/items").then((r) => setItems(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function saveItem() {
    if (!editItem?.name || !editItem.price) { showToast("Name and price required", "error"); return; }
    setLoading(true);
    try {
      if (editItem.id) {
        await api.put(`/api/admin/menu/items/${editItem.id}`, editItem);
        showToast("Item updated");
      } else {
        await api.post("/api/admin/menu/items", editItem);
        showToast("Item created");
      }
      setEditItem(null);
      load();
    } catch { showToast("Save failed", "error"); }
    finally { setLoading(false); }
  }

  async function toggleAvailable(item: MenuItem) {
    await api.put(`/api/admin/menu/items/${item.id}`, { available: !item.available });
    load();
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/api/admin/menu/items/${id}`);
    showToast("Deleted");
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-main)", fontWeight: 800 }}>Menu Items ({items.length})</h2>
        <button onClick={() => setEditItem({ cat_id: categories[0]?.id || "", is_veg: true, available: true })} style={{ padding: "8px 20px", background: "var(--accent)", border: "none", borderRadius: 99, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", color: "#000" }}>+ Add Item</button>
      </div>

      {editItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: 28 }}>
            <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 20 }}>{editItem.id ? "Edit Item" : "New Item"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select value={editItem.cat_id} onChange={(e) => setEditItem((i) => ({ ...i, cat_id: e.target.value }))} style={{ padding: "10px 14px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }}>
                {categories.map((c) => <option key={c.id} value={c.id} style={{ background: "var(--bg-2)" }}>{c.emoji} {c.name}</option>)}
              </select>
              {[{ key: "name", ph: "Item name *" }, { key: "description", ph: "Description" }, { key: "price", ph: "Price *", type: "number" }, { key: "img_url", ph: "Image URL" }, { key: "tag", ph: "Tag (Bestseller, New…)" }].map(({ key, ph, type }) => (
                <input key={key} type={type || "text"} placeholder={ph} value={(editItem as Record<string, unknown>)[key] as string || ""} onChange={(e) => setEditItem((i) => ({ ...i, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                  style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }} />
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.88rem" }}>
                <input type="checkbox" checked={!!editItem.is_veg} onChange={(e) => setEditItem((i) => ({ ...i, is_veg: e.target.checked }))} /> Vegetarian
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveItem} disabled={loading} className="btn-primary">{loading ? "Saving…" : "Save"}</button>
              <button onClick={() => setEditItem(null)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} className="glass-card" style={{ padding: "14px 16px", opacity: item.available ? 1 : 0.5 }}>
            {item.img_url && <div style={{ height: 100, borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 10, position: "relative" }}><Image src={item.img_url} alt={item.name} fill style={{ objectFit: "cover" }} unoptimized /></div>}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 700 }}>{item.name}</span>
              <span style={{ color: "var(--accent)", fontWeight: 800 }}>{fmt(item.price)}</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 }}>{item.description}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditItem(item)} style={{ flex: 1, padding: "6px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 99, fontSize: "0.75rem", cursor: "pointer", color: "var(--text-secondary)" }}>Edit</button>
              <button onClick={() => toggleAvailable(item)} style={{ flex: 1, padding: "6px", background: item.available ? "rgba(0,255,135,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${item.available ? "rgba(0,255,135,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 99, fontSize: "0.75rem", cursor: "pointer", color: item.available ? "var(--accent)" : "#ef4444" }}>{item.available ? "Hide" : "Show"}</button>
              <button onClick={() => deleteItem(item.id)} style={{ padding: "6px 10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 99, fontSize: "0.75rem", cursor: "pointer", color: "#ef4444" }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
