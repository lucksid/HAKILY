import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface User {
  id: number;
  username: string;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  
  // Actions
  initializeSocket: (user: User) => void;
  closeSocket: () => void;
}

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  initializeSocket: (user) => {
    const { socket } = get();
    
    // If socket already exists, close it before creating a new one
    if (socket) {
      socket.close();
    }
    
    // Create new socket connection
    const newSocket = io({
      auth: { userId: user.id, username: user.username }
    });
    
    // Set up event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected");
      set({ isConnected: true });
    });
    
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ isConnected: false });
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      set({ isConnected: false });
    });
    
    set({ socket: newSocket });
  },
  
  closeSocket: () => {
    const { socket } = get();
    
    if (socket) {
      socket.close();
    }
    
    set({ socket: null, isConnected: false });
  }
}));
