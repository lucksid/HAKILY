/**
 * Utilities for handling different deployment environments (development, GitHub Pages, etc.)
 */
import { GameHistoryItem, GameType } from "../../../shared/schema";

/**
 * Detect if the app is running on GitHub Pages
 */
export const isGitHubPages = (): boolean => {
  return window.location.hostname.includes('github.io');
};

/**
 * Get the appropriate API base URL depending on the deployment environment
 */
export const getApiBaseUrl = (): string => {
  if (isGitHubPages()) {
    // When deployed on GitHub Pages, use mock data instead of real API calls
    return '';
  }
  
  // In development or other environments, use the relative path
  return '';
};

/**
 * Generate mock game history data for GitHub Pages deployment
 * This is used when the app is deployed without a backend
 */
export const getMockGameHistory = (): GameHistoryItem[] => {
  return [
    {
      id: 1,
      gameType: "word" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      completedAt: new Date(Date.now() - 1000 * 60 * 25),
      winnerId: 1,
      winnerUsername: "Alice",
      participants: [
        { userId: 1, username: "Alice", score: 75 },
        { userId: 2, username: "Bob", score: 62 }
      ]
    },
    {
      id: 2,
      gameType: "math" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      completedAt: new Date(Date.now() - 1000 * 60 * 110),
      winnerId: 2,
      winnerUsername: "Bob",
      participants: [
        { userId: 1, username: "Alice", score: 85 },
        { userId: 2, username: "Bob", score: 95 },
        { userId: 3, username: "Charlie", score: 70 }
      ]
    },
    {
      id: 3,
      gameType: "quiz" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
      completedAt: new Date(Date.now() - 1000 * 60 * 235),
      winnerId: 3,
      winnerUsername: "Charlie",
      participants: [
        { userId: 2, username: "Bob", score: 60 },
        { userId: 3, username: "Charlie", score: 80 }
      ]
    }
  ];
};

/**
 * Get mock leaderboard data for GitHub Pages deployment
 */
export const getMockLeaderboard = () => {
  return [
    { id: 1, username: "Alice", points: 420 },
    { id: 2, username: "Bob", points: 385 },
    { id: 3, username: "Charlie", points: 350 },
    { id: 4, username: "David", points: 310 },
    { id: 5, username: "Eve", points: 295 }
  ];
};