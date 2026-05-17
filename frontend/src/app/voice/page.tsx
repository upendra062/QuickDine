"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useCart } from "@/store/cartStore";
import api from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";
import BottomNav from "@/components/layout/BottomNav";

interface MenuItem { id: number; name: string; price: number; is_veg: boolean; img_url: string; }

export default function VoicePage() {
  const router = useRouter();
  const { listening, transcript, start, stop, speak } = useVoice();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your voice assistant. Hold the mic and say what you'd like to order." }
  ]);
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) { router.push("/"); return; }
    api.get("/api/menu").then((r) => setMenu(r.data.items)).catch(() => {});
  }, [router]);

  const processCommand = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    const lower = text.toLowerCase();

    const matched = menu.filter((item) => lower.includes(item.name.toLowerCase()));
    if (matched.length > 0) {
      const qtyMatch = lower.match(/(\d+)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      matched.forEach((item) => {
        for (let i = 0; i < qty; i++) add({ id: item.id, name: item.name, price: item.price, img_url: item.img_url, is_veg: item.is_veg });
      });
      const response = `Added ${qty > 1 ? qty + "x " : ""}${matched.map((i) => i.name).join(" and ")} to your cart!`;
      setMessages((m) => [...m, { role: "ai", text: response }]);
      speak(response);
      showToast(response);
    } else if (lower.includes("cart") || lower.includes("checkout")) {
      router.push("/cart");
    } else if (lower.includes("menu")) {
      router.push("/menu");
    } else {
      const response = "I didn't find that item. Try saying something like 'Add Butter Chicken' or 'I want Mango Lassi'.";
      setMessages((m) => [...m, { role: "ai", text: response }]);
      speak(response);
    }
  }, [menu, add, speak, router]);

  useEffect(() => {
    if (!listening && transcript) processCommand(transcript);
  }, [listening, transcript, processCommand]);

  return (
    <div className="page">
      <ToastContainer />
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem" }}>←</button>
        <h1 style={{ fontFamily: "var(--font-main)", fontWeight: 900, fontSize: "1.3rem" }}>Voice Assistant</h1>
      </div>
      <div className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", margin: "20px 0 28px" }}>
          <button onPointerDown={start} onPointerUp={stop} style={{ width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#ec4899,#6366f1)", border: "none", cursor: "pointer", fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: listening ? "0 0 60px rgba(168,85,247,0.7)" : "0 0 40px rgba(168,85,247,0.4)", animation: listening ? "pulse 1.5s ease-in-out infinite" : "none" }}>
            🎤
          </button>
        </div>
        <p style={{ color: listening ? "#a855f7" : "var(--text-muted)", fontSize: "0.88rem", marginBottom: 12, animation: listening ? "blink 1s infinite" : "none" }}>
          {listening ? "Listening…" : "Hold to speak"}
        </p>
        {transcript && <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "var(--radius-lg)", padding: "10px 16px", width: "100%", maxWidth: 400, marginBottom: 12, fontSize: "0.9rem", textAlign: "center" }}>{transcript}</div>}
        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRadius: "var(--radius-lg)", fontSize: "0.85rem", alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "rgba(168,85,247,0.15)" : "var(--glass)", border: `1px solid ${m.role === "user" ? "rgba(168,85,247,0.2)" : "var(--glass-border)"}`, maxWidth: "88%" }}>{m.text}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 400, marginTop: 16 }}>
          {["Add Butter Chicken", "Order Mango Lassi", "Show my cart", "Go to menu"].map((cmd) => (
            <button key={cmd} onClick={() => processCommand(cmd)} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", background: "var(--glass)", border: "1px solid var(--glass-border)", fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>{cmd}</button>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <BottomNav />
    </div>
  );
}
