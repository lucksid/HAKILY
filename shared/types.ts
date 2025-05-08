// Type definitions for the game system

// User and authentication types
export interface User {
  id: number;
  username: string;
  points: number;
}

// Game type identifier
export type GameType = "word" | "math" | "quiz";

// Common game phase
export type GamePhase = "waiting" | "newRound" | "roundActive" | "roundResult" | "gameOver";

// Message for chat system
export interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

// Game invitation
export interface GameInvitation {
  from: string;
  gameType: GameType;
  timestamp: number;
}

// User in the lobby
export interface LobbyUser {
  username: string;
  points: number;
}

// Player in a game
export interface GamePlayer {
  username: string;
  score: number;
  isCurrentPlayer: boolean;
}

// Word Game specific interfaces
export interface WordGamePlayer extends GamePlayer {
  word: string;
  wordValid: boolean;
  wordScore: number;
}

export interface WordGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  letters: string[];
  players: WordGamePlayer[];
  yourWordValid?: boolean;
  yourWordScore?: number;
}

// Math Game specific interfaces
export type MathOperation = "add" | "subtract" | "multiply" | "divide";

export interface MathProblem {
  num1: number;
  num2: number;
  operation: MathOperation;
  options: number[];
  correctAnswer: number;
}

export interface MathGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  players: GamePlayer[];
  currentProblem: MathProblem | null;
  isCorrect?: boolean;
}

// Quiz Game specific interfaces
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

export interface QuizGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  players: GamePlayer[];
  currentQuestion: QuizQuestion | null;
  isCorrect?: boolean;
}

// Leaderboard
export interface LeaderboardEntry {
  username: string;
  points: number;
  gamesPlayed: number;
}

export interface LeaderboardData {
  type: GameType | 'overall';
  players: LeaderboardEntry[];
}

// Game statistics
export interface GameStats {
  gamesPlayed: number;
  totalPoints: number;
}
