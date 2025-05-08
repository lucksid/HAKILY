import { GameHistoryItem } from "../../../shared/schema";
import { isGitHubPages, getMockGameHistory, getApiBaseUrl } from "./deploymentUtils";

/**
 * Fetch game history from the server
 * @param limit Maximum number of history items to retrieve
 * @returns Array of game history items
 */
export async function fetchGameHistory(limit: number = 10): Promise<GameHistoryItem[]> {
  // When running on GitHub Pages, return mock data instead of making API calls
  if (isGitHubPages()) {
    console.log("Running on GitHub Pages - using mock game history data");
    return getMockGameHistory();
  }
  
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/history?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error fetching game history: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch game history:", error);
    return [];
  }
}

/**
 * Fetch game history for a specific user
 * @param userId ID of the user to fetch history for
 * @param limit Maximum number of history items to retrieve
 * @returns Array of game history items
 */
export async function fetchUserGameHistory(userId: number, limit: number = 10): Promise<GameHistoryItem[]> {
  // When running on GitHub Pages, return filtered mock data
  if (isGitHubPages()) {
    console.log(`Running on GitHub Pages - using mock game history data for user ${userId}`);
    // Filter mock data to only include games where the user participated
    const allHistory = getMockGameHistory();
    return allHistory.filter(game => 
      game.participants.some(participant => participant.userId === userId)
    );
  }
  
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/history/user/${userId}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error fetching user game history: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch game history for user ${userId}:`, error);
    return [];
  }
}

/**
 * Fetch game history for a specific game type
 * @param gameType Type of game to fetch history for (word, math, or quiz)
 * @param limit Maximum number of history items to retrieve
 * @returns Array of game history items
 */
export async function fetchGameHistoryByType(gameType: "word" | "math" | "quiz", limit: number = 10): Promise<GameHistoryItem[]> {
  try {
    const response = await fetch(`/api/history/type/${gameType}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error fetching game history for type ${gameType}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${gameType} game history:`, error);
    return [];
  }
}