import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { storage } from "./storage";
import { GameType } from "@shared/schema";

// Import game managers
import { wordGames, createWordGame, addPlayerToWordGame, startWordGame, submitWordAnswer, updateWordGame, getWordGameState, removeWordGame } from "./games/wordGame";
import { mathGames, createMathGame, addPlayerToMathGame, startMathGame, submitMathAnswer, updateMathGame, getMathGameState, removeMathGame } from "./games/mathGame";
import { quizGames, createQuizGame, addPlayerToQuizGame, startQuizGame, submitQuizAnswer, updateQuizGame, getQuizGameState, removeQuizGame } from "./games/quizGame";

// Interface for socket data
interface SocketData {
  userId: number;
  username: string;
  gameRooms: Set<number>;
}

let io: Server;
const UPDATE_INTERVAL = 1000; // 1 second interval for game updates
let gameIntervals: Record<number, NodeJS.Timeout> = {};
let nextGameId = 1;

export function setupSocketServer(httpServer: HttpServer): void {
  io = new Server(httpServer);
  
  // Set up authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const username = socket.handshake.auth.username;
    
    if (!userId || !username) {
      return next(new Error("Authentication error"));
    }
    
    // Store user data in socket
    (socket.data as SocketData) = {
      userId,
      username,
      gameRooms: new Set()
    };
    
    next();
  });
  
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.username} (${socket.data.userId})`);
    
    // Join global chat
    socket.join("global");
    
    // Get active games
    socket.on("getActiveGames", () => {
      sendActiveGames(socket);
    });
    
    // Create a new game
    socket.on("createGame", (data) => {
      createGame(socket, data.type, data.creatorId);
    });
    
    // Join an existing game
    socket.on("joinGame", (data) => {
      joinGame(socket, data.gameId, data.userId);
    });
    
    // Join a game room (for spectating or reconnecting)
    socket.on("joinGameRoom", (data) => {
      joinGameRoom(socket, data.gameId, data.userId);
    });
    
    // Leave a game room
    socket.on("leaveGameRoom", (data) => {
      leaveGameRoom(socket, data.gameId);
    });
    
    // Get game state
    socket.on("getGameState", (data) => {
      sendGameState(socket, data.gameId);
    });
    
    // Start a game
    socket.on("startGame", (data) => {
      startGame(data.gameId);
    });
    
    // Submit word answer
    socket.on("submitWordAnswer", (data) => {
      handleWordAnswer(socket, data.gameId, data.playerId, data.word);
    });
    
    // Submit math answer
    socket.on("submitMathAnswer", (data) => {
      handleMathAnswer(socket, data.gameId, data.playerId, data.answer);
    });
    
    // Submit quiz answer
    socket.on("submitQuizAnswer", (data) => {
      handleQuizAnswer(socket, data.gameId, data.playerId, data.selectedOption);
    });
    
    // Get messages
    socket.on("getMessages", (data) => {
      getMessages(socket, data.gameId);
    });
    
    // Send message
    socket.on("sendMessage", async (data) => {
      sendMessage(socket, data.content, data.gameId);
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.username} (${socket.data.userId})`);
    });
  });
  
  console.log("Socket.IO server initialized");
}

// Send active games to a client
function sendActiveGames(socket: Socket): void {
  const activeGames: { id: number; type: string; players: { id: number; username: string }[]; createdAt: string }[] = [];
  
  // Add word games
  wordGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "word",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  // Add math games
  mathGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "math",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  // Add quiz games
  quizGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "quiz",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  socket.emit("activeGames", activeGames);
}

// Create a new game
function createGame(socket: Socket, type: GameType, creatorId: number): void {
  const gameId = nextGameId++;
  const socketData = socket.data as SocketData;
  
  let game;
  
  switch (type) {
    case "word":
      game = createWordGame(gameId, creatorId, socketData.username);
      break;
    case "math":
      game = createMathGame(gameId, creatorId, socketData.username);
      break;
    case "quiz":
      game = createQuizGame(gameId, creatorId, socketData.username);
      break;
    default:
      socket.emit("gameError", { message: "Invalid game type" });
      return;
  }
  
  // Join the game room
  socket.join(`game:${gameId}`);
  socketData.gameRooms.add(gameId);
  
  // Send game created event
  socket.emit("gameCreated", {
    id: gameId,
    type,
    creatorId,
    createdAt: new Date().toISOString()
  });
  
  // Broadcast active games update to all clients
  io.emit("activeGames", getActiveGamesArray());
  
  // Send game message
  sendGameMessage(gameId, `${socketData.username} created a new ${type} game`);
}

// Join an existing game
function joinGame(socket: Socket, gameId: number, userId: number): void {
  const socketData = socket.data as SocketData;
  
  // Check which game collection has this game
  let game;
  if (wordGames.has(gameId)) {
    game = addPlayerToWordGame(gameId, userId, socketData.username);
  } else if (mathGames.has(gameId)) {
    game = addPlayerToMathGame(gameId, userId, socketData.username);
  } else if (quizGames.has(gameId)) {
    game = addPlayerToQuizGame(gameId, userId, socketData.username);
  }
  
  if (!game) {
    socket.emit("gameError", { message: "Game not found" });
    return;
  }
  
  // Check if game is in waiting state
  if (game.status !== "waiting") {
    socket.emit("gameError", { message: "Game has already started" });
    return;
  }
  
  // Join the game room
  socket.join(`game:${gameId}`);
  socketData.gameRooms.add(gameId);
  
  // Send joined game event
  socket.emit("joinedGame", {
    id: gameId,
    type: wordGames.has(gameId) ? "word" : 
          mathGames.has(gameId) ? "math" : "quiz"
  });
  
  // Broadcast active games update to all clients
  io.emit("activeGames", getActiveGamesArray());
  
  // Send game message
  sendGameMessage(gameId, `${socketData.username} joined the game`);
  
  // Send updated game state to all players in the room
  sendGameState(null, gameId);
}

// Join a game room (for spectating or reconnecting)
function joinGameRoom(socket: Socket, gameId: number, userId: number): void {
  const socketData = socket.data as SocketData;
  
  // Join the game room
  socket.join(`game:${gameId}`);
  socketData.gameRooms.add(gameId);
  
  // Send game state
  sendGameState(socket, gameId);
}

// Leave a game room
function leaveGameRoom(socket: Socket, gameId: number): void {
  const socketData = socket.data as SocketData;
  
  // Leave the game room
  socket.leave(`game:${gameId}`);
  socketData.gameRooms.delete(gameId);
}

// Send game state to clients
function sendGameState(socket: Socket | null, gameId: number): void {
  // Determine which game collection has this game
  let gameState;
  if (wordGames.has(gameId)) {
    gameState = getWordGameState(gameId);
  } else if (mathGames.has(gameId)) {
    gameState = getMathGameState(gameId);
  } else if (quizGames.has(gameId)) {
    gameState = getQuizGameState(gameId);
  }
  
  if (!gameState) {
    if (socket) {
      socket.emit("gameError", { message: "Game not found" });
    }
    return;
  }
  
  // Send to specific socket or broadcast to all in room
  if (socket) {
    socket.emit("gameState", gameState);
  } else {
    io.to(`game:${gameId}`).emit("gameState", gameState);
  }
}

// Start a game
function startGame(gameId: number): void {
  // Determine which game collection has this game
  let game;
  let gameType: GameType;
  
  if (wordGames.has(gameId)) {
    game = startWordGame(gameId);
    gameType = "word";
  } else if (mathGames.has(gameId)) {
    game = startMathGame(gameId);
    gameType = "math";
  } else if (quizGames.has(gameId)) {
    game = startQuizGame(gameId);
    gameType = "quiz";
  }
  
  if (!game) {
    return;
  }
  
  // Set up game interval
  setupGameInterval(gameId, gameType);
  
  // Update active games
  io.emit("activeGames", getActiveGamesArray());
  
  // Send game message
  sendGameMessage(gameId, `Game has started!`);
  
  // Send initial game state
  sendGameState(null, gameId);
}

// Handle word answer submission
function handleWordAnswer(socket: Socket, gameId: number, playerId: number, word: string): void {
  const result = submitWordAnswer(gameId, playerId, word);
  
  if (!result) {
    socket.emit("gameError", { message: "Word game not found" });
    return;
  }
  
  const { game, validSubmission, score } = result;
  
  if (!validSubmission) {
    socket.emit("gameError", { message: "Invalid word submission" });
    return;
  }
  
  // Send game message
  const socketData = socket.data as SocketData;
  if (score > 0) {
    sendGameMessage(gameId, `${socketData.username} submitted "${word}" for ${score} points!`);
    
    // Update user points in database
    storage.updateUserPoints(playerId, score)
      .catch(err => console.error("Error updating user points:", err));
  } else {
    sendGameMessage(gameId, `${socketData.username} submitted an invalid word.`);
  }
  
  // Send updated game state
  sendGameState(null, gameId);
}

// Handle math answer submission
function handleMathAnswer(socket: Socket, gameId: number, playerId: number, answer: number): void {
  const result = submitMathAnswer(gameId, playerId, answer);
  
  if (!result) {
    socket.emit("gameError", { message: "Math game not found" });
    return;
  }
  
  const { game, isCorrect, score } = result;
  
  // Send game message
  const socketData = socket.data as SocketData;
  if (isCorrect) {
    sendGameMessage(gameId, `${socketData.username} answered correctly for ${score} points!`);
    
    // Update user points in database
    storage.updateUserPoints(playerId, score)
      .catch(err => console.error("Error updating user points:", err));
  } else {
    sendGameMessage(gameId, `${socketData.username} answered incorrectly.`);
  }
  
  // Send updated game state
  sendGameState(null, gameId);
}

// Handle quiz answer submission
function handleQuizAnswer(socket: Socket, gameId: number, playerId: number, selectedOption: number): void {
  const result = submitQuizAnswer(gameId, playerId, selectedOption);
  
  if (!result) {
    socket.emit("gameError", { message: "Quiz game not found" });
    return;
  }
  
  const { game, isCorrect, score } = result;
  
  // Send game message
  const socketData = socket.data as SocketData;
  if (isCorrect) {
    sendGameMessage(gameId, `${socketData.username} answered correctly for ${score} points!`);
    
    // Update user points in database
    storage.updateUserPoints(playerId, score)
      .catch(err => console.error("Error updating user points:", err));
  } else {
    sendGameMessage(gameId, `${socketData.username} answered incorrectly.`);
  }
  
  // Send updated game state
  sendGameState(null, gameId);
}

// Set up game update interval
function setupGameInterval(gameId: number, gameType: GameType): void {
  // Clear existing interval if it exists
  if (gameIntervals[gameId]) {
    clearInterval(gameIntervals[gameId]);
  }
  
  // Set up new interval
  gameIntervals[gameId] = setInterval(() => {
    let game;
    
    switch (gameType) {
      case "word":
        game = updateWordGame(gameId);
        break;
      case "math":
        game = updateMathGame(gameId);
        break;
      case "quiz":
        game = updateQuizGame(gameId);
        break;
    }
    
    if (!game) {
      // Game might be finished or removed
      clearInterval(gameIntervals[gameId]);
      delete gameIntervals[gameId];
      return;
    }
    
    // Send updated game state
    sendGameState(null, gameId);
    
    // Check if game just finished
    if (game.status === "finished") {
      const winner = game.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current, 
        { id: 0, username: "", score: -1 }
      );
      
      // Send game over message
      if (winner.score > 0) {
        sendGameMessage(gameId, `Game over! ${winner.username} wins with ${winner.score} points!`);
      } else {
        sendGameMessage(gameId, `Game over! It's a tie!`);
      }
      
      // Clean up interval
      clearInterval(gameIntervals[gameId]);
      delete gameIntervals[gameId];
      
      // Update active games
      io.emit("activeGames", getActiveGamesArray());
    }
  }, UPDATE_INTERVAL);
}

// Get all active games as an array
function getActiveGamesArray(): { id: number; type: string; players: { id: number; username: string }[]; createdAt: string }[] {
  const activeGames: { id: number; type: string; players: { id: number; username: string }[]; createdAt: string }[] = [];
  
  // Add word games
  wordGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "word",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  // Add math games
  mathGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "math",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  // Add quiz games
  quizGames.forEach((game) => {
    if (game.status === "waiting") {
      activeGames.push({
        id: game.id,
        type: "quiz",
        players: game.players.map(p => ({ id: p.id, username: p.username })),
        createdAt: new Date(game.startTime).toISOString()
      });
    }
  });
  
  return activeGames;
}

// Get messages (global or game-specific)
async function getMessages(socket: Socket, gameId?: number): Promise<void> {
  try {
    const messages = await storage.getMessages(undefined, gameId);
    
    // Transform messages to include sender username
    const messagesWithUsername = await Promise.all(
      messages.map(async (message) => {
        const sender = await storage.getUser(message.senderId);
        return {
          ...message,
          senderUsername: sender?.username || "Unknown User"
        };
      })
    );
    
    socket.emit("messageHistory", messagesWithUsername);
  } catch (error) {
    console.error("Error fetching messages:", error);
    socket.emit("gameError", { message: "Could not fetch messages" });
  }
}

// Send a message
async function sendMessage(socket: Socket, content: string, gameId?: number): Promise<void> {
  const socketData = socket.data as SocketData;
  
  try {
    const message = await storage.createMessage(
      socketData.userId,
      content,
      undefined, // No specific receiver
      gameId
    );
    
    // Create enriched message with username
    const enrichedMessage = {
      ...message,
      senderUsername: socketData.username
    };
    
    // Emit to appropriate room
    if (gameId) {
      io.to(`game:${gameId}`).emit("newMessage", enrichedMessage);
    } else {
      io.to("global").emit("newMessage", enrichedMessage);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    socket.emit("gameError", { message: "Could not send message" });
  }
}

// Send a game system message
async function sendGameMessage(gameId: number, content: string): Promise<void> {
  try {
    // Create a system message (sender ID 0 is system)
    const message = await storage.createMessage(
      0, // System user ID
      content,
      undefined,
      gameId
    );
    
    // Create enriched message
    const enrichedMessage = {
      ...message,
      senderUsername: "System"
    };
    
    // Emit to game room
    io.to(`game:${gameId}`).emit("gameMessage", enrichedMessage);
  } catch (error) {
    console.error("Error sending game message:", error);
  }
}
