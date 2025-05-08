// Type definitions for the game

// Game types
export type GameType = "word" | "math" | "quiz";

// Game status
export type GameStatus = "waiting" | "playing" | "finished";

// Base game state interface
export interface GameState {
  id: number;
  type: GameType;
  players: Player[];
  round: number;
  status: GameStatus;
  timeLeft: number;
  startTime: number;
  winner?: Player;
}

// Player interface
export interface Player {
  id: number;
  username: string;
  score: number;
}

// Word game specific interfaces
export interface WordGameState extends GameState {
  type: "word";
  letters: string[];
  submissions: WordSubmission[];
}

export interface WordSubmission {
  playerId: number;
  word: string;
  score: number;
}

// Math game specific interfaces
export interface MathGameState extends GameState {
  type: "math";
  problem: string;
  answer: number;
  submissions: MathSubmission[];
}

export interface MathSubmission {
  playerId: number;
  answer: number;
  isCorrect: boolean;
}

// Quiz game specific interfaces
export interface QuizGameState extends GameState {
  type: "quiz";
  question: string;
  options: string[];
  correctOption: number;
  submissions: QuizSubmission[];
}

export interface QuizSubmission {
  playerId: number;
  selectedOption: number;
  isCorrect: boolean;
}

// Message interface
export interface Message {
  id: number;
  senderId: number;
  senderUsername: string;
  content: string;
  createdAt: string;
  isGameMessage: boolean;
  gameId: number | null;
}
