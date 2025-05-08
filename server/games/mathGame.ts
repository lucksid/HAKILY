import { GameState, MathGameData } from "@shared/schema";
import { generateMathProblem, evaluateMathExpression } from "../../client/src/lib/mathProblems";
import { calculateWinner } from "../../client/src/lib/gameUtils";

export interface MathGame {
  id: number;
  players: { id: number; username: string; score: number }[];
  problem: string;
  answer: number;
  submissions: { playerId: number; answer: number; isCorrect: boolean }[];
  round: number;
  status: "waiting" | "playing" | "finished";
  timeLeft: number;
  startTime: number;
  maxRounds: number;
  firstCorrectPlayerId: number | null;
}

export const mathGames = new Map<number, MathGame>();

// Create a new math game
export function createMathGame(gameId: number, creatorId: number, creatorUsername: string): MathGame {
  const game: MathGame = {
    id: gameId,
    players: [{ id: creatorId, username: creatorUsername, score: 0 }],
    problem: "",
    answer: 0,
    submissions: [],
    round: 0,
    status: "waiting",
    timeLeft: 0,
    startTime: 0,
    maxRounds: 5, // Default to 5 rounds
    firstCorrectPlayerId: null
  };
  
  mathGames.set(gameId, game);
  return game;
}

// Add a player to a math game
export function addPlayerToMathGame(gameId: number, playerId: number, playerUsername: string): MathGame | null {
  const game = mathGames.get(gameId);
  if (!game) return null;
  
  // Check if player is already in the game
  if (game.players.some(p => p.id === playerId)) {
    return game;
  }
  
  // Add player to the game
  game.players.push({ id: playerId, username: playerUsername, score: 0 });
  
  return game;
}

// Start a math game
export function startMathGame(gameId: number): MathGame | null {
  const game = mathGames.get(gameId);
  if (!game) return null;
  
  // Generate problem for the first round
  const mathProblem = generateMathProblem();
  game.problem = mathProblem.problem;
  game.answer = mathProblem.answer;
  game.round = 1;
  game.status = "playing";
  game.timeLeft = 15; // 15 seconds per round
  game.startTime = Date.now();
  game.firstCorrectPlayerId = null;
  
  return game;
}

// Submit a math answer
export function submitMathAnswer(
  gameId: number, 
  playerId: number, 
  answer: number
): { game: MathGame; isCorrect: boolean; score: number } | null {
  const game = mathGames.get(gameId);
  if (!game) return null;
  
  // Check if game is in playing state
  if (game.status !== "playing") {
    return { game, isCorrect: false, score: 0 };
  }
  
  // Check if player has already submitted for this round
  if (game.submissions.some(s => s.playerId === playerId)) {
    return { game, isCorrect: false, score: 0 };
  }
  
  // Check answer
  const isCorrect = Math.abs(answer - game.answer) < 0.001; // Allow for floating point precision issues
  let score = 0;
  
  if (isCorrect) {
    // Award 10 points for correct answer
    score = 10;
    
    // Award 5 bonus points for first correct answer
    if (game.firstCorrectPlayerId === null) {
      game.firstCorrectPlayerId = playerId;
      score += 5;
    }
    
    // Update player's score
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      game.players[playerIndex].score += score;
    }
  }
  
  // Add submission
  game.submissions.push({ playerId, answer, isCorrect });
  
  return { game, isCorrect, score };
}

// Update game state (called by timer)
export function updateMathGame(gameId: number): MathGame | null {
  const game = mathGames.get(gameId);
  if (!game || game.status !== "playing") return null;
  
  // Update time left
  const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
  game.timeLeft = Math.max(0, 15 - elapsed);
  
  // Check if round is over
  if (game.timeLeft === 0) {
    // Check if all rounds are complete
    if (game.round >= game.maxRounds) {
      // Game is over
      game.status = "finished";
    } else {
      // Start next round
      game.round++;
      const mathProblem = generateMathProblem();
      game.problem = mathProblem.problem;
      game.answer = mathProblem.answer;
      game.submissions = [];
      game.timeLeft = 15;
      game.startTime = Date.now();
      game.firstCorrectPlayerId = null;
    }
  }
  
  return game;
}

// Get the game state for clients
export function getMathGameState(gameId: number): GameState | null {
  const game = mathGames.get(gameId);
  if (!game) return null;
  
  const gameState: GameState = {
    id: game.id,
    type: "math",
    players: game.players,
    round: game.round,
    currentTurn: null, // Math game doesn't use turns
    status: game.status,
    timeLeft: game.timeLeft,
    startTime: game.startTime
  };
  
  // Add math game specific data
  const mathGameData: MathGameData = {
    problem: game.problem,
    answer: game.answer,
    submissions: game.submissions
  };
  
  return {
    ...gameState,
    ...mathGameData,
    winner: game.status === "finished" ? calculateWinner(game.players) : undefined
  };
}

// End a math game
export function endMathGame(gameId: number): MathGame | null {
  const game = mathGames.get(gameId);
  if (!game) return null;
  
  game.status = "finished";
  
  return game;
}

// Remove a math game
export function removeMathGame(gameId: number): boolean {
  return mathGames.delete(gameId);
}
