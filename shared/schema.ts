import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Games table to track game history
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // "word", "math", "quiz"
  winnerId: integer("winner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game participants table
export const gameParticipants = pgTable("game_participants", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull().default(0),
});

// Messages table for chat functionality
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isGameMessage: boolean("is_game_message").default(false),
  gameId: integer("game_id").references(() => games.id),
});

// Validation schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Game-specific types
export type GameType = "word" | "math" | "quiz";

export type GameState = {
  id: number;
  type: GameType;
  players: { id: number; username: string; score: number }[];
  round: number;
  currentTurn: number | null;
  status: "waiting" | "playing" | "finished";
  timeLeft: number;
  startTime: number;
};

export type WordGameData = {
  letters: string[];
  submissions: { playerId: number; word: string; score: number }[];
};

export type MathGameData = {
  problem: string;
  answer: number;
  submissions: { playerId: number; answer: number; isCorrect: boolean }[];
};

export type QuizGameData = {
  question: string;
  options: string[];
  correctOption: number;
  submissions: { playerId: number; selectedOption: number; isCorrect: boolean }[];
};
