import { create } from "zustand";
import { apiRequest } from "../queryClient";

interface User {
  id: number;
  username: string;
  points: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  authChecked: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updatePoints: (points: number) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  authChecked: false,
  isLoading: false,
  
  login: (user) => {
    // Store user in local storage
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  
  logout: () => {
    // Clear user from local storage
    localStorage.removeItem("user");
    set({ user: null });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // First check if we have a user in local storage
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Validate the stored user with an API call
        try {
          const response = await apiRequest("GET", `/api/users/profile?userId=${user.id}`);
          const data = await response.json();
          
          if (data.user) {
            set({ user: data.user });
          } else {
            // Invalid user, log out
            localStorage.removeItem("user");
            set({ user: null });
          }
        } catch (error) {
          // API error, keep using stored user but log the error
          console.error("Error validating stored user:", error);
          set({ user });
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      set({ authChecked: true, isLoading: false });
    }
  },
  
  updatePoints: (points) => {
    const { user } = get();
    
    if (user) {
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      
      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  }
}));
