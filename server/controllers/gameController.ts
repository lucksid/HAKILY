import { Request, Response } from "express";
import { storage } from "../storage";
import { GameType } from "@shared/types";

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'overall' } = req.query;
    
    const leaderboardType = type as GameType | 'overall';
    
    // Get all users
    const users = await storage.getAllUsers();
    
    // Sort by points and pick top 10
    const topUsers = users
      .sort((a, b) => {
        // Sort by specific game stats or overall points
        switch (leaderboardType) {
          case 'word':
            return b.wordGameStats.totalPoints - a.wordGameStats.totalPoints;
          case 'math':
            return b.mathGameStats.totalPoints - a.mathGameStats.totalPoints;
          case 'quiz':
            return b.quizGameStats.totalPoints - a.quizGameStats.totalPoints;
          case 'overall':
          default:
            return b.points - a.points;
        }
      })
      .slice(0, 10)
      .map(user => {
        // Return formatted data based on game type
        let points: number;
        let gamesPlayed: number;
        
        switch (leaderboardType) {
          case 'word':
            points = user.wordGameStats.totalPoints;
            gamesPlayed = user.wordGameStats.gamesPlayed;
            break;
          case 'math':
            points = user.mathGameStats.totalPoints;
            gamesPlayed = user.mathGameStats.gamesPlayed;
            break;
          case 'quiz':
            points = user.quizGameStats.totalPoints;
            gamesPlayed = user.quizGameStats.gamesPlayed;
            break;
          case 'overall':
          default:
            points = user.points;
            gamesPlayed = user.wordGameStats.gamesPlayed + 
                         user.mathGameStats.gamesPlayed + 
                         user.quizGameStats.gamesPlayed;
            break;
        }
        
        return {
          username: user.username,
          points,
          gamesPlayed
        };
      });
    
    return res.status(200).json({
      type: leaderboardType,
      players: topUsers
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserPoints = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { points, gameType } = req.body;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: "Points must be a number" });
    }
    
    const updatedUser = await storage.updateUserPoints(userId, points, gameType as GameType);
    
    return res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points
    });
  } catch (error) {
    console.error("Update points error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
