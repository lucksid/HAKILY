import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, comparePasswords } from "../services/auth";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Find user
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Check password
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set session data
    req.session.userId = user.id;
    
    // Return user data (without password)
    return res.status(200).json({
      id: user.id,
      username: user.username,
      points: user.points,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
    });
    
    // Set session data
    req.session.userId = user.id;
    
    // Return user data (without password)
    return res.status(201).json({
      id: user.id,
      username: user.username,
      points: user.points,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid user data", 
        errors: error.errors 
      });
    }
    
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      // User ID in session but not found in storage
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    
    // Return user data (without password)
    return res.status(200).json({
      id: user.id,
      username: user.username,
      points: user.points,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
