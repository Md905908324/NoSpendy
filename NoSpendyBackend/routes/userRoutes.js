const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, location, monthlyIncome, savingsGoal } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: "User already exists with that email or username" 
      });
    }
    
    // Create new user
    const newUser = new User({ 
      username, 
      email, 
      password,
      location: location || "",
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
      savingsGoal: savingsGoal ? parseFloat(savingsGoal) : 0
    });
    
    await newUser.save();
    
    // Generate token
    const token = generateToken(newUser._id);
    
    // Return user data and token
    res.status(201).json({ 
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      location: newUser.location,
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Find user by email or username
    const user = await User.findOne({ 
      $or: [
        { email: email || '' }, 
        { username: username || '' }
      ] 
    });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Calculate streak
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    
    // Reset hours to compare just the dates
    now.setHours(0, 0, 0, 0);
    lastLogin.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDifference = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    // Update streak based on login pattern
    if (daysDifference === 1) {
      // Consecutive day login - increase streak
      user.streak += 1;
    } else if (daysDifference > 1) {
      // Missed days - reset streak
      user.streak = 1;
    }
    // If daysDifference is 0 (same day login), don't change the streak
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data and token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      location: user.location,
      monthlyIncome: user.monthlyIncome,
      savingsGoal: user.savingsGoal,
      streak: user.streak,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify token
router.get("/verify-token", auth, (req, res) => {
  res.json({ valid: true, user: { 
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email
  }});
});

// Get user profile
router.get("/profile", auth, (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    location: req.user.location,
    monthlyIncome: req.user.monthlyIncome,
    savingsGoal: req.user.savingsGoal,
    monthlySpending: req.user.monthlySpending
  });
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['username', 'email', 'location', 'monthlyIncome', 'savingsGoal'];
    
    // Filter out disallowed updates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
    
    // Update user
    Object.assign(req.user, filteredUpdates);
    await req.user.save();
    
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      location: req.user.location,
      monthlyIncome: req.user.monthlyIncome,
      savingsGoal: req.user.savingsGoal
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;