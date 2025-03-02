const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const User = require("../models/user");
const mongoose = require("mongoose");
const auth = require('../middleware/auth');

// Add a new expense (actual spending)
router.post("/add", auth, async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const userId = req.user._id;
    
    // Validate inputs
    if (!amount || !category) {
      return res.status(400).json({ error: "Missing required fields: amount and category are required" });
    }
    
    // Ensure amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ error: "Amount must be a valid number" });
    }
    
    // Create the expense record (actual spending)
    const newExpense = new Expense({ 
      userId, 
      amount: parsedAmount, 
      category,
      description: description || ""
    });
    
    await newExpense.save();
    console.log("Expense saved:", newExpense);
    
    // Update the user's monthly spending
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update monthly spending
    user.monthlySpending += parsedAmount;
    
    // Update daily expense tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for consistent comparison
    
    // Check if we already have an entry for today
    let todayExpenseFound = false;
    
    for (let i = 0; i < user.dailyExpenses.length; i++) {
      const expenseDate = new Date(user.dailyExpenses[i].date);
      expenseDate.setHours(0, 0, 0, 0);
      
      if (expenseDate.getTime() === today.getTime()) {
        // Update existing entry for today
        user.dailyExpenses[i].amount += parsedAmount;
        todayExpenseFound = true;
        break;
      }
    }
    
    // If no entry for today, create a new one
    if (!todayExpenseFound) {
      user.dailyExpenses.push({
        date: today,
        amount: parsedAmount
      });
    }
    
    await user.save();
    
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense." });
  }
});

// Get monthly spending for a user
router.get("/monthly", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: firstDayOfMonth }
    });
    
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    res.json({
      userId,
      month: now.getMonth() + 1, // 1-12 instead of 0-11
      year: now.getFullYear(),
      totalSpent,
      expenses
    });
  } catch (error) {
    console.error("Error retrieving monthly expenses:", error);
    res.status(500).json({ error: "Failed to retrieve monthly expenses." });
  }
});

// Get all expenses for a user
router.get("/all", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    res.status(500).json({ error: "Failed to retrieve expenses." });
  }
});

// Get expenses by category
router.get("/category/:category", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.params;
    
    const expenses = await Expense.find({ 
      userId,
      category
    }).sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error("Error retrieving expenses by category:", error);
    res.status(500).json({ error: "Failed to retrieve expenses." });
  }
});

// Get expenses by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Looking for expenses with userId:", userId);
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    console.log("Found expenses:", expenses);
    res.json(expenses);
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    res.status(500).json({ error: "Failed to retrieve expenses." });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Expense routes are working" });
});

// Add a test expense (for debugging)
router.get("/add-test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const testExpense = new Expense({
      userId,
      amount: 9.99,
      category: "Test"
    });
    await testExpense.save();
    
    // Update user's monthly spending
    const user = await User.findById(userId);
    if (user) {
      user.monthlySpending += 9.99;
      await user.save();
    }
    
    res.json({ 
      message: "Test expense added successfully!",
      expense: testExpense
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add test expense." });
  }
});

// Get daily expense history for a user
router.get("/daily-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Attempting to fetch daily history for user: ${userId}`);
    
    const { days } = req.query;
    console.log(`Days parameter: ${days}`);
    
    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid ObjectId: ${userId}`);
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId).select("dailyExpenses");
    console.log(`User found: ${!!user}`);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`Daily expenses count: ${user.dailyExpenses.length}`);
    
    // Sort by date (newest first)
    const sortedExpenses = [...user.dailyExpenses].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Limit to requested number of days if specified
    const limitedExpenses = days ? sortedExpenses.slice(0, parseInt(days)) : sortedExpenses;
    
    res.json({
      userId,
      dailyExpenses: limitedExpenses
    });
  } catch (error) {
    console.error("Error retrieving daily expense history:", error);
    res.status(500).json({ error: "Failed to retrieve daily expense history." });
  }
});

// Test endpoint to check if a user exists
router.get("/test-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("_id username");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      message: "User found",
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error("Error testing user:", error);
    res.status(500).json({ error: "Failed to test user." });
  }
});

// Debug route to check daily expenses
router.get("/debug-daily/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("dailyExpenses");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get raw data for debugging
    const rawDailyExpenses = user.dailyExpenses.map(expense => ({
      date: expense.date,
      dateString: expense.date.toString(),
      amount: expense.amount,
      dateObj: {
        year: expense.date.getFullYear(),
        month: expense.date.getMonth(),
        day: expense.date.getDate()
      }
    }));
    
    res.json({
      userId,
      dailyExpensesCount: user.dailyExpenses.length,
      rawDailyExpenses
    });
  } catch (error) {
    console.error("Error debugging daily expenses:", error);
    res.status(500).json({ error: "Failed to debug daily expenses." });
  }
});

module.exports = router;