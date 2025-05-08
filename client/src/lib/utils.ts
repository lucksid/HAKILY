import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

// Generate random letters for word game
export function generateRandomLetters(count: number = 7): string[] {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const letters: string[] = [];
  
  // Ensure at least 2 vowels
  for (let i = 0; i < 2; i++) {
    letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
  }
  
  // Fill remaining letters with a mix of vowels and consonants
  for (let i = letters.length; i < count; i++) {
    // 30% chance of vowel, 70% chance of consonant
    const useVowel = Math.random() < 0.3;
    const source = useVowel ? vowels : consonants;
    letters.push(source[Math.floor(Math.random() * source.length)]);
  }
  
  // Shuffle the array
  return letters.sort(() => Math.random() - 0.5);
}

export { getLocalStorage, setLocalStorage };
