import { GameState, QuizGameData } from "@shared/schema";
import { getRandomQuestion } from "../../client/src/lib/quizQuestions";
import { calculateWinner } from "../../client/src/lib/gameUtils";

export interface QuizGame {
  id: number;
  players: { id: number; username: string; score: number }[];
  question: string;
  options: string[];
  correctOption: number;
  submissions: { playerId: number; selectedOption: number; isCorrect: boolean }[];
  round: number;
  status: "waiting" | "playing" | "finished";
  timeLeft: number;
  startTime: number;
  maxRounds: number;
  firstCorrectPlayerId: number | null;
}

export const quizGames = new Map<number, QuizGame>();

// Create a new quiz game
export function createQuizGame(gameId: number, creatorId: number, creatorUsername: string): QuizGame {
  const game: QuizGame = {
    id: gameId,
    players: [{ id: creatorId, username: creatorUsername, score: 0 }],
    question: "",
    options: [],
    correctOption: 0,
    submissions: [],
    round: 0,
    status: "waiting",
    timeLeft: 0,
    startTime: 0,
    maxRounds: 5, // Default to 5 rounds
    firstCorrectPlayerId: null
  };
  
  quizGames.set(gameId, game);
  return game;
}

// Add a player to a quiz game
export function addPlayerToQuizGame(gameId: number, playerId: number, playerUsername: string): QuizGame | null {
  const game = quizGames.get(gameId);
  if (!game) return null;
  
  // Check if player is already in the game
  if (game.players.some(p => p.id === playerId)) {
    return game;
  }
  
  // Add player to the game
  game.players.push({ id: playerId, username: playerUsername, score: 0 });
  
  return game;
}

// Start a quiz game
export function startQuizGame(gameId: number): QuizGame | null {
  const game = quizGames.get(gameId);
  if (!game) return null;
  
  // Generate question for the first round
  const quizQuestion = getRandomQuestion();
  game.question = quizQuestion.question;
  game.options = quizQuestion.options;
  game.correctOption = quizQuestion.correctOption;
  game.round = 1;
  game.status = "playing";
  game.timeLeft = 15; // 15 seconds per round
  game.startTime = Date.now();
  game.firstCorrectPlayerId = null;
  
  return game;
}

// Submit a quiz answer
export function submitQuizAnswer(
  gameId: number, 
  playerId: number, 
  selectedOption: number
): { game: QuizGame; isCorrect: boolean; score: number } | null {
  const game = quizGames.get(gameId);
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
  const isCorrect = selectedOption === game.correctOption;
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
  game.submissions.push({ playerId, selectedOption, isCorrect });
  
  return { game, isCorrect, score };
}

// Update game state (called by timer)
export function updateQuizGame(gameId: number): QuizGame | null {
  const game = quizGames.get(gameId);
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
      const quizQuestion = getRandomQuestion();
      game.question = quizQuestion.question;
      game.options = quizQuestion.options;
      game.correctOption = quizQuestion.correctOption;
      game.submissions = [];
      game.timeLeft = 15;
      game.startTime = Date.now();
      game.firstCorrectPlayerId = null;
    }
  }
  
  return game;
}

// Get the game state for clients
export function getQuizGameState(gameId: number): GameState | null {
  const game = quizGames.get(gameId);
  if (!game) return null;
  
  const gameState: GameState = {
    id: game.id,
    type: "quiz",
    players: game.players,
    round: game.round,
    currentTurn: null, // Quiz game doesn't use turns
    status: game.status,
    timeLeft: game.timeLeft,
    startTime: game.startTime
  };
  
  // Add quiz game specific data
  const quizGameData: QuizGameData = {
    question: game.question,
    options: game.options,
    correctOption: game.correctOption,
    submissions: game.submissions
  };
  
  return {
    ...gameState,
    ...quizGameData,
    winner: game.status === "finished" ? calculateWinner(game.players) : undefined
  };
}

// End a quiz game
export function endQuizGame(gameId: number): QuizGame | null {
  const game = quizGames.get(gameId);
  if (!game) return null;
  
  game.status = "finished";
  
  return game;
}

// Remove a quiz game
export function removeQuizGame(gameId: number): boolean {
  return quizGames.delete(gameId);
}
