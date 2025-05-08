import { GameState, WordGameData } from "@shared/schema";
import { generateRandomLetters, calculateWordScore, isValidWord } from "../../client/src/lib/dictionary";
import { calculateWinner } from "../../client/src/lib/gameUtils";

export interface WordGame {
  id: number;
  players: { id: number; username: string; score: number }[];
  letters: string[];
  submissions: { playerId: number; word: string; score: number }[];
  round: number;
  status: "waiting" | "playing" | "finished";
  timeLeft: number;
  startTime: number;
  maxRounds: number;
}

export const wordGames = new Map<number, WordGame>();

// Create a new word game
export function createWordGame(gameId: number, creatorId: number, creatorUsername: string): WordGame {
  const game: WordGame = {
    id: gameId,
    players: [{ id: creatorId, username: creatorUsername, score: 0 }],
    letters: [],
    submissions: [],
    round: 0,
    status: "waiting",
    timeLeft: 0,
    startTime: 0,
    maxRounds: 5 // Default to 5 rounds
  };
  
  wordGames.set(gameId, game);
  return game;
}

// Add a player to a word game
export function addPlayerToWordGame(gameId: number, playerId: number, playerUsername: string): WordGame | null {
  const game = wordGames.get(gameId);
  if (!game) return null;
  
  // Check if player is already in the game
  if (game.players.some(p => p.id === playerId)) {
    return game;
  }
  
  // Add player to the game
  game.players.push({ id: playerId, username: playerUsername, score: 0 });
  
  return game;
}

// Start a word game
export function startWordGame(gameId: number): WordGame | null {
  const game = wordGames.get(gameId);
  if (!game) return null;
  
  // Generate letters for the first round
  game.letters = generateRandomLetters();
  game.round = 1;
  game.status = "playing";
  game.timeLeft = 15; // 15 seconds per round
  game.startTime = Date.now();
  
  return game;
}

// Submit a word answer
export function submitWordAnswer(
  gameId: number, 
  playerId: number, 
  word: string
): { game: WordGame; validSubmission: boolean; score: number } | null {
  const game = wordGames.get(gameId);
  if (!game) return null;
  
  // Check if game is in playing state
  if (game.status !== "playing") {
    return { game, validSubmission: false, score: 0 };
  }
  
  // Check if player has already submitted for this round
  if (game.submissions.some(s => s.playerId === playerId)) {
    return { game, validSubmission: false, score: 0 };
  }
  
  // Validate the word
  const upperWord = word.toUpperCase();
  let allLettersValid = true;
  
  // Check if all letters in the word are available in the game letters
  const availableLetters = [...game.letters];
  
  for (const char of upperWord) {
    const index = availableLetters.indexOf(char);
    if (index === -1) {
      allLettersValid = false;
      break;
    }
    // Remove the used letter from available letters
    availableLetters.splice(index, 1);
  }
  
  if (!allLettersValid || !isValidWord(word)) {
    return { game, validSubmission: false, score: 0 };
  }
  
  // Calculate score
  const score = calculateWordScore(word);
  
  // Add submission
  game.submissions.push({ playerId, word: upperWord, score });
  
  // Update player's score
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex !== -1) {
    game.players[playerIndex].score += score;
  }
  
  return { game, validSubmission: true, score };
}

// Update game state (called by timer)
export function updateWordGame(gameId: number): WordGame | null {
  const game = wordGames.get(gameId);
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
      game.letters = generateRandomLetters();
      game.submissions = [];
      game.timeLeft = 15;
      game.startTime = Date.now();
    }
  }
  
  return game;
}

// Get the game state for clients
export function getWordGameState(gameId: number): GameState | null {
  const game = wordGames.get(gameId);
  if (!game) return null;
  
  const gameState: GameState = {
    id: game.id,
    type: "word",
    players: game.players,
    round: game.round,
    currentTurn: null, // Word game doesn't use turns
    status: game.status,
    timeLeft: game.timeLeft,
    startTime: game.startTime
  };
  
  // Add word game specific data
  const wordGameData: WordGameData = {
    letters: game.letters,
    submissions: game.submissions
  };
  
  return {
    ...gameState,
    ...wordGameData,
    winner: game.status === "finished" ? calculateWinner(game.players) : undefined
  };
}

// End a word game
export function endWordGame(gameId: number): WordGame | null {
  const game = wordGames.get(gameId);
  if (!game) return null;
  
  game.status = "finished";
  
  return game;
}

// Remove a word game
export function removeWordGame(gameId: number): boolean {
  return wordGames.delete(gameId);
}
