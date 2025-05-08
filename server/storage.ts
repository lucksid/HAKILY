import { users, type User, type InsertUser, type Game, type GameParticipant, type Message, type GameHistoryItem } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { games, gameParticipants, messages } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Game operations
  createGame(gameType: string, creatorId: number): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getActiveGames(): Promise<Game[]>;
  updateGameWinner(gameId: number, winnerId: number): Promise<Game>;
  
  // Game history operations
  getGameHistory(limit?: number): Promise<GameHistoryItem[]>; // Get all game history
  getUserGameHistory(userId: number, limit?: number): Promise<GameHistoryItem[]>; // Get user's game history
  getGameHistoryByType(gameType: string, limit?: number): Promise<GameHistoryItem[]>; // Get game history by type

  // Game participants
  addPlayerToGame(gameId: number, userId: number): Promise<GameParticipant>;
  updatePlayerScore(gameId: number, userId: number, score: number): Promise<GameParticipant>;
  getGameParticipants(gameId: number): Promise<GameParticipant[]>;
  
  // Messages
  createMessage(senderId: number, content: string, receiverId?: number, gameId?: number): Promise<Message>;
  getMessages(receiverId?: number, gameId?: number, limit?: number): Promise<Message[]>;
}

// PostgreSQL implementation
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ points: sql`${users.points} + ${points}` })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }
  
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    const result = await this.db
      .select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
    
    return result;
  }
  
  // Game operations
  async createGame(gameType: string, creatorId: number): Promise<Game> {
    const result = await this.db
      .insert(games)
      .values({ gameType })
      .returning();
    
    const game = result[0];
    
    // Add creator as first participant
    await this.addPlayerToGame(game.id, creatorId);
    
    return game;
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    const result = await this.db.select().from(games).where(eq(games.id, id)).limit(1);
    return result[0];
  }
  
  async getActiveGames(): Promise<Game[]> {
    return this.db
      .select()
      .from(games)
      .where(sql`${games.winnerId} IS NULL`)
      .orderBy(desc(games.createdAt));
  }
  
  async updateGameWinner(gameId: number, winnerId: number): Promise<Game> {
    const result = await this.db
      .update(games)
      .set({ winnerId })
      .where(eq(games.id, gameId))
      .returning();
    return result[0];
  }
  
  // Game history operations
  async getGameHistory(limit: number = 10): Promise<GameHistoryItem[]> {
    // Get completed games (games with a winner)
    const completedGames = await this.db
      .select({
        id: games.id,
        gameType: games.gameType,
        createdAt: games.createdAt,
        winnerId: games.winnerId
      })
      .from(games)
      .where(sql`${games.winnerId} IS NOT NULL`) // Only completed games
      .orderBy(desc(games.createdAt))
      .limit(limit);
    
    // Build full game history with player information
    const gameHistory: GameHistoryItem[] = [];
    
    for (const game of completedGames) {
      // Get all participants for this game
      const participants = await this.db
        .select({
          userId: gameParticipants.userId,
          score: gameParticipants.score
        })
        .from(gameParticipants)
        .where(eq(gameParticipants.gameId, game.id));
      
      // Get usernames for all participants
      const participantsWithUsernames = await Promise.all(
        participants.map(async (participant) => {
          const user = await this.getUser(participant.userId);
          return {
            userId: participant.userId,
            username: user?.username || 'Unknown Player',
            score: participant.score
          };
        })
      );
      
      // Get winner username if there's a winner
      let winnerUsername: string | undefined;
      if (game.winnerId) {
        const winner = await this.getUser(game.winnerId);
        winnerUsername = winner?.username;
      }
      
      gameHistory.push({
        id: game.id,
        gameType: game.gameType as any, // Type casting since DB stores as string
        createdAt: game.createdAt,
        winnerId: game.winnerId,
        winnerUsername,
        participants: participantsWithUsernames
      });
    }
    
    return gameHistory;
  }
  
  async getUserGameHistory(userId: number, limit: number = 10): Promise<GameHistoryItem[]> {
    // Find games where this user participated
    const userParticipations = await this.db
      .select({
        gameId: gameParticipants.gameId
      })
      .from(gameParticipants)
      .where(eq(gameParticipants.userId, userId))
      .limit(limit);
    
    // Get game details for these games
    const gameIds = userParticipations.map(p => p.gameId);
    if (gameIds.length === 0) return [];
    
    // Use game history helper with specific game IDs
    const allGameHistory = await this.getGameHistory(limit);
    return allGameHistory.filter(game => gameIds.includes(game.id));
  }
  
  async getGameHistoryByType(gameType: string, limit: number = 10): Promise<GameHistoryItem[]> {
    // Get all game history and filter by type
    const allGameHistory = await this.getGameHistory(limit * 2); // Get more items to account for filtering
    return allGameHistory
      .filter(game => game.gameType === gameType)
      .slice(0, limit);
  }
  
  // Game participants
  async addPlayerToGame(gameId: number, userId: number): Promise<GameParticipant> {
    const result = await this.db
      .insert(gameParticipants)
      .values({ gameId, userId })
      .returning();
    return result[0];
  }
  
  async updatePlayerScore(gameId: number, userId: number, score: number): Promise<GameParticipant> {
    const result = await this.db
      .update(gameParticipants)
      .set({ score })
      .where(sql`${gameParticipants.gameId} = ${gameId} AND ${gameParticipants.userId} = ${userId}`)
      .returning();
    return result[0];
  }
  
  async getGameParticipants(gameId: number): Promise<GameParticipant[]> {
    return this.db
      .select()
      .from(gameParticipants)
      .where(eq(gameParticipants.gameId, gameId));
  }
  
  // Messages
  async createMessage(senderId: number, content: string, receiverId?: number, gameId?: number): Promise<Message> {
    const result = await this.db
      .insert(messages)
      .values({
        senderId,
        content,
        receiverId,
        gameId,
        isGameMessage: gameId !== undefined
      })
      .returning();
    return result[0];
  }
  
  async getMessages(receiverId?: number, gameId?: number, limit: number = 50): Promise<Message[]> {
    let query = this.db.select().from(messages);
    
    if (receiverId) {
      query = query.where(eq(messages.receiverId, receiverId));
    }
    
    if (gameId) {
      query = query.where(eq(messages.gameId, gameId));
    }
    
    return query.orderBy(desc(messages.createdAt)).limit(limit);
  }
}

// Memory storage fallback for local development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private participants: Map<number, GameParticipant[]>;
  private userMessages: Map<number, Message[]>;
  private gameMessages: Map<number, Message[]>;
  
  currentUserId: number;
  currentGameId: number;
  currentParticipantId: number;
  currentMessageId: number;
  
  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.participants = new Map();
    this.userMessages = new Map();
    this.gameMessages = new Map();
    
    this.currentUserId = 1;
    this.currentGameId = 1;
    this.currentParticipantId = 1;
    this.currentMessageId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      points: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      points: user.points + points 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        username: user.username,
        password: user.password,
        points: user.points,
        createdAt: user.createdAt
      }));
  }
  
  // Game operations
  async createGame(gameType: string, creatorId: number): Promise<Game> {
    const id = this.currentGameId++;
    const now = new Date();
    const game: Game = {
      id,
      gameType,
      winnerId: null,
      createdAt: now
    };
    
    this.games.set(id, game);
    
    // Add creator as first participant
    await this.addPlayerToGame(id, creatorId);
    
    return game;
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async getActiveGames(): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.winnerId === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateGameWinner(gameId: number, winnerId: number): Promise<Game> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    
    const updatedGame = { ...game, winnerId };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }
  
  // Game history operations
  async getGameHistory(limit: number = 10): Promise<GameHistoryItem[]> {
    // Get completed games (with a winner)
    const completedGames = Array.from(this.games.values())
      .filter(game => game.winnerId !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    // Build full game history with player information
    const gameHistory: GameHistoryItem[] = [];
    
    for (const game of completedGames) {
      // Get all participants for this game
      const gameParticipants = this.participants.get(game.id) || [];
      
      // Get usernames for all participants
      const participantsWithUsernames = await Promise.all(
        gameParticipants.map(async (participant) => {
          const user = await this.getUser(participant.userId);
          return {
            userId: participant.userId,
            username: user?.username || 'Unknown Player',
            score: participant.score
          };
        })
      );
      
      // Get winner username if there's a winner
      let winnerUsername: string | undefined;
      if (game.winnerId) {
        const winner = await this.getUser(game.winnerId);
        winnerUsername = winner?.username;
      }
      
      gameHistory.push({
        id: game.id,
        gameType: game.gameType as any, // Type casting since we store as string
        createdAt: game.createdAt,
        winnerId: game.winnerId,
        winnerUsername,
        participants: participantsWithUsernames
      });
    }
    
    return gameHistory;
  }
  
  async getUserGameHistory(userId: number, limit: number = 10): Promise<GameHistoryItem[]> {
    // Get all game history
    const allGameHistory = await this.getGameHistory(limit * 2); // Get more to filter
    
    // Filter for games where this user participated
    return allGameHistory
      .filter(game => game.participants.some(p => p.userId === userId))
      .slice(0, limit);
  }
  
  async getGameHistoryByType(gameType: string, limit: number = 10): Promise<GameHistoryItem[]> {
    // Get all game history and filter by type
    const allGameHistory = await this.getGameHistory(limit * 2); // Get more to filter
    
    return allGameHistory
      .filter(game => game.gameType === gameType)
      .slice(0, limit);
  }
  
  // Game participants
  async addPlayerToGame(gameId: number, userId: number): Promise<GameParticipant> {
    const id = this.currentParticipantId++;
    const participant: GameParticipant = {
      id,
      gameId,
      userId,
      score: 0
    };
    
    const currentParticipants = this.participants.get(gameId) || [];
    this.participants.set(gameId, [...currentParticipants, participant]);
    
    return participant;
  }
  
  async updatePlayerScore(gameId: number, userId: number, score: number): Promise<GameParticipant> {
    const participants = this.participants.get(gameId) || [];
    const participantIndex = participants.findIndex(p => p.userId === userId);
    
    if (participantIndex === -1) throw new Error("Participant not found");
    
    const updatedParticipant = { ...participants[participantIndex], score };
    participants[participantIndex] = updatedParticipant;
    this.participants.set(gameId, participants);
    
    return updatedParticipant;
  }
  
  async getGameParticipants(gameId: number): Promise<GameParticipant[]> {
    return this.participants.get(gameId) || [];
  }
  
  // Messages
  async createMessage(senderId: number, content: string, receiverId?: number, gameId?: number): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = {
      id,
      senderId,
      receiverId: receiverId || null,
      content,
      createdAt: now,
      isGameMessage: gameId !== undefined,
      gameId: gameId || null
    };
    
    if (gameId) {
      const gameMessages = this.gameMessages.get(gameId) || [];
      this.gameMessages.set(gameId, [...gameMessages, message]);
    } else if (receiverId) {
      const userMessages = this.userMessages.get(receiverId) || [];
      this.userMessages.set(receiverId, [...userMessages, message]);
    }
    
    return message;
  }
  
  async getMessages(receiverId?: number, gameId?: number, limit: number = 50): Promise<Message[]> {
    if (gameId) {
      const gameMessages = this.gameMessages.get(gameId) || [];
      return gameMessages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }
    
    if (receiverId) {
      const userMessages = this.userMessages.get(receiverId) || [];
      return userMessages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }
    
    return [];
  }
}

// Decide which storage implementation to use based on environment
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage()
  : new MemStorage();
