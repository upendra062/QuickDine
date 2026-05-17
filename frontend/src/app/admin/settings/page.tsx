"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tables, setTables] = useState<{ id: number; name: string }[]>([]);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/admin/settings").then((r) => setSettings(r.data)).catch(() => {});
    api.get("/api/admin/tables").then((r) => setTables(r.data)).catch(() => {});
  }, []);

  async function saveSettings() {
    await api.put("/api/admin/settings", settings);
    showToast("Settings saved");
  }

  async function generateQR(tableId: number) {
    try {
      const res = await api.get(`/api/admin/tables/${tableId}/qr`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      setQrUrl(url);
      setSelectedTable(tableId);
    } catch { showToast("QR generation failed", "error"); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 16 }}>Restaurant Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[{ key: "rest_name", label: "Restaurant Name" }, { key: "tagline", label: "Tagline" }, { key: "tax_rate", label: "Tax Rate (%)", type: "number" }].map(({ key, label, type }) => (
            <div key={key}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
              <input type={type || "text"} value={settings[key] || ""} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }} />
            </div>
          ))}
        </div>
        <button onClick={saveSettings} style={{ marginTop: 16, padding: "10px 28px", background: "var(--accent)", border: "none", borderRadius: 99, fontWeight: 700, cursor: "pointer", color: "#000" }}>Save Settings</button>
      </div>

      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-main)", fontWeight: 800, marginBottom: 16 }}>QR Codes</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 10, marginBottom: 20 }}>
          {tables.map((t) => (
            <button key={t.id} onClick={() => generateQR(t.id)} style={{ padding: "10px 8px", borderRadius: "var(--radius-sm)", background: selectedTable === t.id ? "rgba(0,255,135,0.1)" : "var(--glass)", border: `1px solid ${selectedTable === t.id ? "var(--accent)" : "var(--glass-border)"}`, cursor: "pointer", color: selectedTable === t.id ? "var(--accent)" : "var(--text-secondary)", fontWeight: 600, fontSize: "0.8rem" }}>
              Table {t.name}
            </button>
          ))}
        </div>
        {qrUrl && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#fff", padding: 16, borderRadius: "var(--radius-md)", position: "relative", width: 200, height: 200 }}>
              <Image src={qrUrl} alt={`Table ${selectedTable} QR`} fill style={{ objectFit: "contain" }} />
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Table {selectedTable} QR Code</p>
            <a href={qrUrl} download={`table_${selectedTable}_qr.png`} style={{ padding: "8px 24px", background: "var(--accent)", borderRadius: 99, fontWeight: 700, fontSize: "0.82rem", color: "#000", textDecoration: "none" }}>Download PNG</a>
          </div>
        )}
      </div>
    </div>
  );
}
