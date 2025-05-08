import { GameType } from "@shared/schema";

// Utility functions for game logic

// Format time display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get color based on time left
export function getTimerColor(timeLeft: number, totalTime: number): string {
  const percentage = (timeLeft / totalTime) * 100;
  
  if (percentage <= 25) {
    return "text-red-500"; // Critical time (red)
  } else if (percentage <= 50) {
    return "text-amber-500"; // Warning time (amber)
  } else {
    return "text-green-500"; // Plenty of time (green)
  }
}

// Game type display names
export const gameTypeNames: Record<GameType, string> = {
  word: "Word Challenge",
  math: "Math Wizards",
  quiz: "Quiz Masters"
};

// Game type descriptions
export const gameTypeDescriptions: Record<GameType, string> = {
  word: "Create the longest word with 7 random letters. Vowels = 1 point, Consonants = 2 points.",
  math: "Solve math problems with addition, subtraction, multiplication, and division.",
  quiz: "Test your knowledge with general culture questions."
};

// Game icons for each game type
export const gameIcons: Record<GameType, string> = {
  word: "📝",
  math: "🔢",
  quiz: "❓"
};

// Calculate the winner from a list of players
export function calculateWinner(players: Array<{ id: number; username: string; score: number }>): { id: number; username: string; score: number } | null {
  if (!players || players.length === 0) {
    return null;
  }
  
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Check if there's a tie for first place
  if (sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score) {
    // It's a tie - no clear winner
    return null;
  }
  
  // Return the player with the highest score
  return sortedPlayers[0];
}

// Shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
