import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSocketServer } from "./socket";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { loginUserSchema } from "@shared/schema";
import { getGameHistory, getGameHistoryByType, getUserGameHistory } from "./controllers/historyController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupSocketServer(httpServer);
  
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = loginUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create new user
      const newUser = await storage.createUser({
        username: userData.username,
        password: hashedPassword,
      });
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Could not register user" });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const userData = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(userData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(userData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // User routes
  app.get('/api/users/profile', async (req, res) => {
    try {
      // TODO: Implement session authentication
      // For now, use query parameter
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Could not fetch user profile" });
    }
  });
  
  // Leaderboard route
  app.get('/api/leaderboard', async (_req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json({ leaderboard });
    } catch (error) {
      res.status(500).json({ message: "Could not fetch leaderboard" });
    }
  });
  
  // Game routes
  app.get('/api/games', async (_req, res) => {
    try {
      const activeGames = await storage.getActiveGames();
      res.json({ games: activeGames });
    } catch (error) {
      res.status(500).json({ message: "Could not fetch active games" });
    }
  });
  
  app.get('/api/games/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ game });
    } catch (error) {
      res.status(500).json({ message: "Could not fetch game details" });
    }
  });
  
  // Game history routes
  app.get('/api/history', getGameHistory);
  app.get('/api/history/user/:userId', getUserGameHistory);
  app.get('/api/history/type/:type', getGameHistoryByType);
  
  return httpServer;
}
