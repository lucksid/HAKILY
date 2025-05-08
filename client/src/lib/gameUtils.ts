/**
 * Calculate a score for a word based on letter value
 * Vowels are worth 1 point, consonants are worth 2 points
 * Plus bonus points for longer words
 */
export function calculateWordScore(word: string): number {
  if (!word) return 0;
  
  let score = 0;
  const normalizedWord = word.toUpperCase();
  
  // Add points for each letter (vowels=1, consonants=2)
  for (const letter of normalizedWord) {
    if (/[AEIOU]/.test(letter)) {
      score += 1; // Vowels are worth 1 point
    } else {
      score += 2; // Consonants are worth 2 points
    }
  }
  
  // Add bonus for longer words
  if (word.length > 5) score += 3;
  else if (word.length > 3) score += 1;
  
  return score;
}

/**
 * Calculate the winner of a game based on player scores
 */
export function calculateWinner(players: { id: number; username: string; score: number }[]): number | null {
  if (!players || players.length === 0) return null;
  
  let highestScore = -1;
  let winnerId: number | null = null;
  
  for (const player of players) {
    if (player.score > highestScore) {
      highestScore = player.score;
      winnerId = player.id;
    }
  }
  
  return winnerId;
}