import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { storage } from "../storage";
import { WordGame } from "../games/wordGame";
import { MathGame } from "../games/mathGame";
import { QuizGame } from "../games/quizGame";
import { GameType, Message } from "@shared/types";

// Store active users and their socket IDs
const activeUsers = new Map<string, { userId: number; socketId: string; username: string }>();

// Store active games
const activeGames = {
  word: new Map<string, WordGame>(),
  math: new Map<string, MathGame>(),
  quiz: new Map<string, QuizGame>()
};

// Chat messages history (in-memory for simplicity)
const messageHistory: Message[] = [];
const MAX_MESSAGE_HISTORY = 50;

export function setupSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5000"],
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const username = socket.handshake.auth.username;
    
    if (!userId || !username) {
      return next(new Error("Authentication error"));
    }
    
    // Store connection info
    socket.data.userId = userId;
    socket.data.username = username;
    next();
  });
  
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;
    
    console.log(`User connected: ${username} (${socket.id})`);
    
    // Add user to active users
    activeUsers.set(username, { userId, socketId: socket.id, username });
    
    // Broadcast updated online users list
    broadcastOnlineUsers(io);
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${username}`);
      
      // Remove from active users
      activeUsers.delete(username);
      
      // Remove from any active games
      removeFromGames(username);
      
      // Broadcast updated online users list
      broadcastOnlineUsers(io);
    });
    
    // Chat message handlers
    socket.on("sendMessage", (data: { content: string }) => {
      const message: Message = {
        sender: username,
        content: data.content,
        timestamp: Date.now()
      };
      
      // Add to history
      messageHistory.push(message);
      if (messageHistory.length > MAX_MESSAGE_HISTORY) {
        messageHistory.shift();
      }
      
      // Broadcast to all users
      io.emit("message", message);
    });
    
    socket.on("getMessageHistory", () => {
      socket.emit("messageHistory", messageHistory);
    });
    
    // Game invitations
    socket.on("sendInvitation", (data: { to: string; gameType: GameType }) => {
      const targetUser = activeUsers.get(data.to);
      
      if (targetUser) {
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        
        if (targetSocket) {
          targetSocket.emit("gameInvitation", {
            from: username,
            gameType: data.gameType,
            timestamp: Date.now()
          });
        }
      }
    });
    
    socket.on("acceptInvitation", (data: { from: string; gameType: GameType }) => {
      const inviter = activeUsers.get(data.from);
      
      if (!inviter) return;
      
      const inviterSocket = io.sockets.sockets.get(inviter.socketId);
      if (!inviterSocket) return;
      
      // Create a new game instance if needed
      createGameInstance(data.gameType, io);
      
      // Add both players to the game
      const game = getGameInstance(data.gameType, username);
      
      if (game) {
        game.addPlayer(socket, username);
        game.addPlayer(inviterSocket, data.from);
        
        // Notify both players that the game is starting
        socket.emit("gameStart", { gameType: data.gameType });
        inviterSocket.emit("gameStart", { gameType: data.gameType });
      }
    });
    
    socket.on("declineInvitation", (data: { from: string }) => {
      const inviter = activeUsers.get(data.from);
      
      if (inviter) {
        const inviterSocket = io.sockets.sockets.get(inviter.socketId);
        
        if (inviterSocket) {
          inviterSocket.emit("invitationCancelled", username);
        }
      }
    });
    
    // Game actions
    socket.on("submitWord", (data: { word: string }) => {
      const game = getGameInstance("word", username);
      if (game) {
        game.submitWord(socket, data.word);
      }
    });
    
    socket.on("submitMathAnswer", (data: { answer: number | null }) => {
      const game = getGameInstance("math", username);
      if (game) {
        game.submitAnswer(socket, data.answer);
      }
    });
    
    socket.on("submitQuizAnswer", (data: { answer: string | null }) => {
      const game = getGameInstance("quiz", username);
      if (game) {
        game.submitAnswer(socket, data.answer);
      }
    });
    
    socket.on("readyForNextRound", () => {
      // Try all game types
      ["word", "math", "quiz"].forEach((type) => {
        const game = getGameInstance(type as GameType, username);
        if (game) {
          game.readyForNextRound(socket);
        }
      });
    });
    
    socket.on("returnToLobby", () => {
      // Remove from all games
      removeFromGames(username);
    });
    
    // Leaderboard
    socket.on("getLeaderboard", async (data: { type: GameType | 'overall' }) => {
      try {
        // Get all users
        const users = await storage.getAllUsers();
        
        // Sort by points and pick top 10
        const topUsers = users
          .sort((a, b) => {
            // Sort by specific game stats or overall points
            switch (data.type) {
              case 'word':
                return b.wordGameStats.totalPoints - a.wordGameStats.totalPoints;
              case 'math':
                return b.mathGameStats.totalPoints - a.mathGameStats.totalPoints;
              case 'quiz':
                return b.quizGameStats.totalPoints - a.quizGameStats.totalPoints;
              case 'overall':
              default:
                return b.points - a.points;
            }
          })
          .slice(0, 10)
          .map(user => {
            // Return formatted data based on game type
            let points: number;
            let gamesPlayed: number;
            
            switch (data.type) {
              case 'word':
                points = user.wordGameStats.totalPoints;
                gamesPlayed = user.wordGameStats.gamesPlayed;
                break;
              case 'math':
                points = user.mathGameStats.totalPoints;
                gamesPlayed = user.mathGameStats.gamesPlayed;
                break;
              case 'quiz':
                points = user.quizGameStats.totalPoints;
                gamesPlayed = user.quizGameStats.gamesPlayed;
                break;
              case 'overall':
              default:
                points = user.points;
                gamesPlayed = user.wordGameStats.gamesPlayed + 
                             user.mathGameStats.gamesPlayed + 
                             user.quizGameStats.gamesPlayed;
                break;
            }
            
            return {
              username: user.username,
              points,
              gamesPlayed
            };
          });
        
        socket.emit("leaderboardData", {
          type: data.type,
          players: topUsers
        });
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    });
  });
  
  return io;
}

// Helper functions

function broadcastOnlineUsers(io: Server) {
  const users = Array.from(activeUsers.values()).map(user => ({
    username: user.username,
    points: 0 // We would get this from the database in a real implementation
  }));
  
  io.emit("onlineUsers", users);
}

function createGameInstance(gameType: GameType, io: Server) {
  switch (gameType) {
    case "word":
      const wordGame = new WordGame(io);
      activeGames.word.set(generateGameId(), wordGame);
      break;
    case "math":
      const mathGame = new MathGame(io);
      activeGames.math.set(generateGameId(), mathGame);
      break;
    case "quiz":
      const quizGame = new QuizGame(io);
      activeGames.quiz.set(generateGameId(), quizGame);
      break;
  }
}

function getGameInstance(gameType: GameType, username: string) {
  let targetGame: WordGame | MathGame | QuizGame | undefined;
  
  // Find a game that has this player
  switch (gameType) {
    case "word":
      for (const game of activeGames.word.values()) {
        if (game.players.some(p => p.username === username)) {
          targetGame = game;
          break;
        }
      }
      break;
    case "math":
      for (const game of activeGames.math.values()) {
        if (game.players.some(p => p.username === username)) {
          targetGame = game;
          break;
        }
      }
      break;
    case "quiz":
      for (const game of activeGames.quiz.values()) {
        if (game.players.some(p => p.username === username)) {
          targetGame = game;
          break;
        }
      }
      break;
  }
  
  return targetGame;
}

function removeFromGames(username: string) {
  // Word games
  for (const game of activeGames.word.values()) {
    game.removePlayer(username);
  }
  
  // Math games
  for (const game of activeGames.math.values()) {
    game.removePlayer(username);
  }
  
  // Quiz games
  for (const game of activeGames.quiz.values()) {
    game.removePlayer(username);
  }
  
  // Clean up empty games
  cleanupEmptyGames();
}

function cleanupEmptyGames() {
  // Word games
  for (const [id, game] of activeGames.word.entries()) {
    if (game.players.length === 0) {
      activeGames.word.delete(id);
    }
  }
  
  // Math games
  for (const [id, game] of activeGames.math.entries()) {
    if (game.players.length === 0) {
      activeGames.math.delete(id);
    }
  }
  
  // Quiz games
  for (const [id, game] of activeGames.quiz.entries()) {
    if (game.players.length === 0) {
      activeGames.quiz.delete(id);
    }
  }
}

function generateGameId() {
  return `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
