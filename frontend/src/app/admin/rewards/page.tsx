"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

interface User { phone: string; name: string; points: number; spent: number; }
interface Config { points_per_rupee: number; points_value: number; min_redemption: number; }

export default function RewardsMgmtPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<Config>({ points_per_rupee: 1, points_value: 0.1, min_redemption: 100 });

  useEffect(() => {
    api.get("/api/admin/rewards/users").then((r) => setUsers(r.data)).catch(() => {});
    api.get("/api/admin/rewards/config").then((r) => setConfig(r.data)).catch(() => {});
  }, []);

  async function saveConfig() {
    await api.put("/api/admin/rewards/config", config);
    showToast("Config saved");
  }

  return (
    <div>
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 16 }}>Reward Config</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[{ key: "points_per_rupee", label: "Points per ₹1" }, { key: "points_value", label: "₹ value per point" }, { key: "min_redemption", label: "Min redemption pts" }].map(({ key, label }) => (
            <div key={key}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <input type="number" step="0.01" value={(config as unknown as Record<string, number>)[key]} onChange={(e) => setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none" }} />
            </div>
          ))}
        </div>
        <button onClick={saveConfig} style={{ padding: "8px 24px", background: "var(--accent)", border: "none", borderRadius: 99, fontWeight: 700, cursor: "pointer", color: "#000" }}>Save Config</button>
      </div>

      <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 14 }}>Top Customers</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map((u, idx) => (
          <div key={u.phone} className="glass-card" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.1rem", color: idx === 0 ? "#f59e0b" : "var(--text-muted)", width: 24 }}>#{idx + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>{u.name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.phone} · Spent {fmt(u.spent)}</p>
            </div>
            <span style={{ color: "var(--accent)", fontWeight: 800 }}>{u.points.toLocaleString()} pts</span>
          </div>
        ))}
        {!users.length && <p style={{ color: "var(--text-muted)" }}>No loyalty users yet.</p>}
      </div>
    </div>
  );
}
