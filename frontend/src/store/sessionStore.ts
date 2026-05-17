"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SessionState {
  name: string;
  phone: string | null;
  tableId: number | null;
  token: string | null;
  isPremium: boolean;
  setSession: (data: Partial<SessionState>) => void;
  clear: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      name: "",
      phone: null,
      tableId: null,
      token: null,
      isPremium: false,
      setSession: (data) => set((s) => ({ ...s, ...data })),
      clear: () => set({ name: "", phone: null, tableId: null, token: null, isPremium: false }),
    }),
    { name: "qd-session", storage: createJSONStorage(() => sessionStorage) }
  )
);
