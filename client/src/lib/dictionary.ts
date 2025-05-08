// Dictionary validation using an external API
// We use the Free Dictionary API to validate words

// Cache to store previously checked words and avoid repeated API calls
const wordValidationCache: Record<string, boolean> = {};

/**
 * Check if a word is valid by using an external dictionary API
 * @param word The word to validate
 * @returns Promise<boolean> True if the word is valid
 */
export async function checkWordWithAPI(word: string): Promise<boolean> {
  // Ignore empty words or words less than 3 letters
  if (!word || word.length < 3) return false;

  // Convert to lowercase for consistent checks
  const normalizedWord = word.toLowerCase();
  
  // First check if we've already validated this word
  if (wordValidationCache[normalizedWord] !== undefined) {
    return wordValidationCache[normalizedWord];
  }
  
  try {
    // Use the Free Dictionary API to check if the word exists
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`);
    
    // If status is 200, the word exists; if 404, it doesn't
    const isValid = response.status === 200;
    
    // Cache the result for future checks
    wordValidationCache[normalizedWord] = isValid;
    
    return isValid;
  } catch (error) {
    console.error('Error checking word:', error);
    
    // In case of API failure, fall back to allowing the word
    // This prevents blocking players due to connectivity issues
    return true;
  }
}

// A fallback list of common words if the API is ever down
const commonWords = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with",
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out",
  "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them",
  "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want",
  "because", "any", "these", "give", "day", "most", "us",
  // Common game-related words
  "play", "game", "score", "win", "lose", "draw", "turn", "move", "board", "card", "dice",
  "piece", "token", "team", "match", "round", "level", "bonus", "points", "rules", "player",
  // Common 3-letter words
  "act", "add", "age", "ago", "air", "all", "and", "any", "arm", "art", "ask", "bad", "bag", "bar",
  "bat", "bed", "bet", "big", "bit", "bob", "box", "boy", "bus", "but", "buy", "can", "car", "cat",
  "cup", "cut", "dad", "day", "did", "die", "dog", "dry", "due", "eat", "egg", "end", "eye", "far",
  "fat", "few", "fit", "fix", "fly", "for", "fun", "gas", "get", "god", "got", "gun", "guy", "had",
  "has", "hat", "her", "him", "his", "hit", "hot", "how", "ice", "its", "job", "key", "kid", "law",
  "lay", "leg", "let", "lie", "lot", "low", "man", "map", "may", "men", "met", "mom", "mrs", "net",
  "new", "nor", "not", "now", "odd", "off", "oil", "old", "one", "our", "out", "own", "pay", "per",
  "put", "ran", "red", "rid", "run", "saw", "say", "sea", "see", "set", "she", "sir", "sit", "six",
  "son", "sun", "tax", "tea", "ten", "the", "tie", "too", "top", "try", "two", "use", "war", "was",
  "way", "web", "who", "why", "win", "yes", "yet", "you", "act", "add", "age", "aim", "air", "and",
  "any", "arm", "art", "ask", "bad", "bag", "ban", "bar", "bat", "bed", "bee", "beg", "bet", "bid",
  "big", "bit", "bob", "bow", "box", "boy", "bud", "bug", "bun", "bus", "but", "buy", "can", "cap",
  "car", "cat", "cow", "cry", "cup", "cut", "dad", "dam", "day", "den", "dew", "did", "die", "dig",
  "dim", "dip", "doe", "dog", "dot", "dry", "due", "dug", "dye", "ear", "eat", "egg", "ego", "elf",
  "end", "era", "eve", "eye", "fan", "far", "fat", "fee", "few", "fig", "fin", "fit", "fix", "fly",
  "fog", "for", "fox", "fry", "fun", "fur", "gap", "gas", "gel", "gem", "get", "gin", "god", "got",
  "gum", "gun", "gut", "guy", "gym", "had", "ham", "has", "hat", "hay", "hem", "hen", "her", "hey",
  "hid", "him", "hip", "his", "hit", "hog", "hop", "hot", "how", "hub", "hug", "hut", "ice", "icy",
  "ill", "ink", "inn", "ion", "its", "jam", "jar", "jaw", "jet", "jew", "job", "jog", "joy", "key",
  "kid", "kin", "kit", "lab", "lad", "lag", "lap", "law", "lay", "leg", "let", "lid", "lie", "lip",
  "lit", "log", "lot", "low", "mad", "man", "map", "mat", "may", "men", "met", "mid", "mix", "mob",
  "mom", "mop", "mud", "mug", "nap", "net", "new", "nod", "nor", "not", "now", "nun", "nut", "oak",
  "odd", "off", "oil", "old", "one", "orb", "ore", "our", "out", "owl", "own", "pad", "pal", "pan",
  "pea", "pen", "per", "pet", "pie", "pig", "pin", "pit", "pod", "pop", "pot", "pub", "pun", "pup",
  "put", "rad", "rag", "ram", "ran", "rap", "rat", "raw", "red", "rib", "rid", "rig", "rim", "rip",
  "rob", "rod", "rot", "row", "rub", "rug", "rum", "run", "sad", "sag", "sal", "sap", "sat", "saw",
  "say", "sea", "see", "set", "sew", "she", "shy", "sin", "sip", "sir", "sis", "sit", "six", "ski",
  "sky", "sly", "spy", "son", "sow", "spa", "stir", "sub", "sue", "sum", "sun", "tab", "tag", "tan",
  "tap", "tar", "tax", "tea", "ten", "the", "tie", "til", "tin", "tip", "toe", "ton", "too", "top",
  "toy", "try", "tub", "tug", "two", "use", "van", "vat", "vet", "via", "vie", "vow", "wag", "war",
  "was", "wax", "way", "web", "wed", "wet", "who", "why", "wig", "win", "wit", "woe", "won", "wow",
  "yes", "yet", "you", "zip", "zoo" 
]);

/**
 * Synchronous function to check if a word is valid (for use when API is not available)
 * Uses the fallback dictionary if the API check is in progress
 * @param word The word to validate
 * @returns boolean True if the word is valid or we're not sure (giving benefit of doubt)
 */
export function isValidWord(word: string): boolean {
  if (!word || word.length < 3) return false;
  
  const normalizedWord = word.toLowerCase();
  
  // If we have a cached result, use it
  if (wordValidationCache[normalizedWord] !== undefined) {
    return wordValidationCache[normalizedWord];
  }
  
  // If we haven't checked this word yet, give the benefit of doubt
  // and let the async validation complete later
  // Check against our minimal fallback dictionary
  return commonWords.has(normalizedWord);
}