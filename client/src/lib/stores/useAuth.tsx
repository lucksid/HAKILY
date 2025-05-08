import { create } from "zustand";
import { User } from "@shared/types";
import { apiRequest } from "../queryClient";

interface AuthState {
  user: User | null;
  initialized: boolean;
  
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  
  setUser: (user) => set({ user }),
  
  logout: async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      set({ user: null });
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear the user on client side even if the API call fails
      set({ user: null });
    }
  },
  
  checkAuth: async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });
      
      if (response.ok) {
        const user = await response.json();
        set({ user, initialized: true });
      } else {
        set({ user: null, initialized: true });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null, initialized: true });
    }
  }
}));

// Initialize auth state by checking if user is already logged in
(() => {
  useAuth.getState().checkAuth();
})();
