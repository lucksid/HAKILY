/**
 * Generate an array of random letters with a good mix of vowels and consonants
 * @param count Number of letters to generate
 * @returns Array of random letters
 */
export function generateRandomLetters(count: number = 7): string[] {
  // Define vowels and consonants
  const vowels = "AEIOU";
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  
  // Ensure a good mix of vowels and consonants
  // For 7 letters, we want 2-3 vowels and 4-5 consonants
  const targetVowelCount = Math.floor(count * 0.4); // ~40% vowels
  
  const letters: string[] = [];
  let vowelCount = 0;
  
  // Add random letters
  for (let i = 0; i < count; i++) {
    // Determine if we need to force a vowel or consonant
    const remainingSpots = count - i;
    const neededVowels = targetVowelCount - vowelCount;
    const mustBeVowel = neededVowels >= remainingSpots;
    const mustBeConsonant = vowelCount >= targetVowelCount;
    
    let letter: string;
    
    if (mustBeVowel) {
      // Must add a vowel
      letter = vowels.charAt(Math.floor(Math.random() * vowels.length));
      vowelCount++;
    } else if (mustBeConsonant) {
      // Must add a consonant
      letter = consonants.charAt(Math.floor(Math.random() * consonants.length));
    } else {
      // Can be either
      if (Math.random() < 0.4) {
        // Add a vowel
        letter = vowels.charAt(Math.floor(Math.random() * vowels.length));
        vowelCount++;
      } else {
        // Add a consonant
        letter = consonants.charAt(Math.floor(Math.random() * consonants.length));
      }
    }
    
    letters.push(letter);
  }
  
  return letters;
}