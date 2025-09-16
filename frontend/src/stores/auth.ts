import { create } from "zustand";
import { logout as logoutApi } from "@/lib/logout";

type AuthState = {
  isAuthenticated: boolean;
  hydrate: () => void;
  setAuthenticated: (v: boolean) => void;
  logout: () => Promise<void>;
};

function hasAccessToken() {
  return /(?:^|;\s*)accessToken=([^;]+)/.test(document.cookie);
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hydrate: () => set({ isAuthenticated: hasAccessToken() }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  logout: async () => {
    await logoutApi();
    set({ isAuthenticated: false });
  },
}));
