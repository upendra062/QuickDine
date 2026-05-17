"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { fmt, fmtDate } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface Coupon { code: string; discount: number; type: string; used: boolean; expires_at: string | null; source: string; created_at: string; }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", discount: "", type: "percent", expires_at: "" });

  function load() { api.get("/api/admin/coupons").then((r) => setCoupons(r.data)).catch(() => {}); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.discount) { showToast("Code and discount required", "error"); return; }
    try {
      await api.post("/api/admin/coupons", { code: form.code, discount: Number(form.discount), type: form.type, expires_at: form.expires_at || null });
      showToast("Coupon created");
      setForm({ code: "", discount: "", type: "percent", expires_at: "" });
      load();
    } catch { showToast("Failed or code exists", "error"); }
  }

  async function deleteCoupon(code: string) {
    await api.delete(`/api/admin/coupons/${code}`);
    showToast("Deleted");
    load();
  }

  return (
    <div>
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 16 }}>Create Coupon</h3>
        <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[{ key: "code", ph: "Code e.g. SAVE20", col: 2 }, { key: "discount", ph: "Discount amount/%" }, { key: "expires_at", ph: "Expires at", type: "date" }].map(({ key, ph, col, type }) => (
            <input key={key} type={type || "text"} placeholder={ph} value={(form as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ gridColumn: col ? `span ${col}` : undefined, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }} />
          ))}
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ padding: "10px 14px", background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }}>
            <option value="percent" style={{ background: "var(--bg-2)" }}>Percent (%)</option>
            <option value="flat" style={{ background: "var(--bg-2)" }}>Flat (₹)</option>
          </select>
          <button type="submit" style={{ padding: "10px", background: "var(--accent)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", color: "#000" }}>Create</button>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {coupons.map((c) => (
          <div key={c.code} className="glass-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: c.used ? 0.5 : 1 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "var(--font-main)", fontWeight: 800, letterSpacing: 2, color: c.used ? "var(--text-muted)" : "var(--accent)" }}>{c.code}</span>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                {c.discount}{c.type === "percent" ? "%" : "₹"} off · {c.used ? "Used" : "Active"} · {c.expires_at ? fmtDate(c.expires_at) : "No expiry"}
              </p>
            </div>
            {!c.used && <button onClick={() => deleteCoupon(c.code)} style={{ padding: "5px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 99, color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
