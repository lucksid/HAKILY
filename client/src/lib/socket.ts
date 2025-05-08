import { io, Socket } from "socket.io-client";
import { User } from "@shared/types";

// Create a socket instance
export const createSocket = (user: User) => {
  const socket = io({
    auth: {
      userId: user.id,
      username: user.username
    },
    autoConnect: true
  });
  
  // Log socket events for debugging
  socket.on("connect", () => {
    console.log("Socket connected with ID:", socket.id);
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });
  
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
  
  return socket;
};
