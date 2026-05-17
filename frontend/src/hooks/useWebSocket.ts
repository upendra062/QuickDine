"use client";
import { useEffect, useRef, useCallback } from "react";

type Handler = (payload: { type: string; data: unknown }) => void;

export function useWebSocket(channel: string, onMessage: Handler) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const url = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/${channel}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };
    ws.onclose = () => {
      retryRef.current = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  }, [channel, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);
}

export function playAlert(type: "order" | "help") {
  if (typeof window === "undefined") return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = type === "order" ? 880 : 660;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}
