import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Check if user is authenticated and add user object to request
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Please login" });
    }
    
    // Get user from storage
    const user = await storage.getUser(userId);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      username: user.username,
      points: user.points
    };
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        points: number;
      };
    }
  }
}
