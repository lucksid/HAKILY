import { create } from "zustand";
import { Socket } from "socket.io-client";
import { createSocket } from "../socket";
import { GameInvitation, GameType, User } from "@shared/types";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  gameInvitations: GameInvitation[];
  
  connectSocket: (user: User) => void;
  disconnectSocket: () => void;
  
  // Game invitations
  addInvitation: (invitation: GameInvitation) => void;
  removeInvitation: (username: string) => void;
  sendInvitation: (to: string, gameType: GameType) => void;
  acceptInvitation: (from: string, gameType: GameType) => void;
  declineInvitation: (from: string) => void;
}

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  gameInvitations: [],
  
  connectSocket: (user) => {
    const { socket } = get();
    
    // Don't reconnect if already connected
    if (socket && socket.connected) return;
    
    // Create new socket connection
    const newSocket = createSocket(user);
    
    // Set up invitation listeners
    newSocket.on('gameInvitation', (invitation: GameInvitation) => {
      get().addInvitation(invitation);
    });
    
    newSocket.on('invitationCancelled', (username: string) => {
      get().removeInvitation(username);
    });
    
    // Update state
    set({ 
      socket: newSocket, 
      connected: true
    });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    
    if (socket) {
      socket.disconnect();
    }
    
    set({ 
      socket: null, 
      connected: false,
      gameInvitations: []
    });
  },
  
  addInvitation: (invitation) => {
    set((state) => ({
      gameInvitations: [
        ...state.gameInvitations.filter(inv => inv.from !== invitation.from),
        invitation
      ]
    }));
  },
  
  removeInvitation: (username) => {
    set((state) => ({
      gameInvitations: state.gameInvitations.filter(inv => inv.from !== username)
    }));
  },
  
  sendInvitation: (to, gameType) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sendInvitation', { to, gameType });
    }
  },
  
  acceptInvitation: (from, gameType) => {
    const { socket } = get();
    if (socket) {
      socket.emit('acceptInvitation', { from, gameType });
      // Remove the invitation from the list
      get().removeInvitation(from);
    }
  },
  
  declineInvitation: (from) => {
    const { socket } = get();
    if (socket) {
      socket.emit('declineInvitation', { from });
      // Remove the invitation from the list
      get().removeInvitation(from);
    }
  }
}));
