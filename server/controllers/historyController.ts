import { Request, Response } from "express";
import { storage } from "../storage";

/**
 * Get all game history
 */
export const getGameHistory = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const history = await storage.getGameHistory(limit);
    res.json(history);
  } catch (error) {
    console.error("Error fetching game history:", error);
    res.status(500).json({ error: "Failed to fetch game history" });
  }
};

/**
 * Get game history for a specific user
 */
export const getUserGameHistory = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const history = await storage.getUserGameHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error("Error fetching user game history:", error);
    res.status(500).json({ error: "Failed to fetch user game history" });
  }
};

/**
 * Get game history by game type
 */
export const getGameHistoryByType = async (req: Request, res: Response) => {
  try {
    const gameType = req.params.type;
    if (!["word", "math", "quiz"].includes(gameType)) {
      return res.status(400).json({ error: "Invalid game type" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const history = await storage.getGameHistoryByType(gameType, limit);
    res.json(history);
  } catch (error) {
    console.error("Error fetching game history by type:", error);
    res.status(500).json({ error: "Failed to fetch game history by type" });
  }
};