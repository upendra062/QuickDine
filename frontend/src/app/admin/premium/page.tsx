"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

interface Member { phone: string; name: string; added_at: string; }

export default function PremiumPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  function load() { api.get("/api/admin/premium/members").then((r) => setMembers(r.data)).catch(() => {}); }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!phone || !name) { showToast("Phone and name required", "error"); return; }
    try { await api.post("/api/admin/premium/members", { phone, name }); showToast("Member added"); setPhone(""); setName(""); load(); }
    catch { showToast("Failed or already member", "error"); }
  }

  async function remove(p: string) {
    await api.delete(`/api/admin/premium/members/${p}`);
    showToast("Removed"); load();
  }

  return (
    <div>
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24, background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.05))", border: "1px solid rgba(245,158,11,0.2)" }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 16, color: "#f59e0b" }}>⭐ Add Premium Member</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ st: phone, set: setPhone, ph: "Phone number" }, { st: name, set: setName, ph: "Full name" }].map(({ st, set, ph }) => (
            <input key={ph} placeholder={ph} value={st} onChange={(e) => set(e.target.value)}
              style={{ flex: 1, minWidth: 160, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }} />
          ))}
          <button onClick={add} style={{ padding: "10px 24px", background: "#f59e0b", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", color: "#000" }}>Add Member</button>
        </div>
      </div>

      <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 14 }}>Premium Members ({members.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map((m) => (
          <div key={m.phone} className="glass-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.4rem" }}>⭐</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>{m.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.phone}</p>
            </div>
            <button onClick={() => remove(m.phone)} style={{ padding: "5px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 99, color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}>Remove</button>
          </div>
        ))}
        {!members.length && <p style={{ color: "var(--text-muted)" }}>No premium members yet.</p>}
      </div>
    </div>
  );
}
