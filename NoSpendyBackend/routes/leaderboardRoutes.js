const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Challenge = require("../models/Challenge");
const Expense = require("../models/expense");
const mongoose = require("mongoose");
const { getCostOfLivingIndex, adjustSpendingForState } = require('../utils/costOfLiving');
const auth = require('../middleware/auth');

// Get global leaderboard (lowest spenders, adjusted for cost of living)
router.get("/global", async (req, res) => {
  try {
    // Get all users with their spending and state
    const users = await User.find()
      .select("username monthlySpending streakDays badges state");
    
    // Calculate adjusted spending for each user based on their state
    const usersWithAdjustedSpending = users
      // Filter out users with no spending
      .filter(user => user.monthlySpending > 0)
      .map(user => {
        const adjustedSpending = user.state ? 
          adjustSpendingForState(user.monthlySpending, user.state) : 
          user.monthlySpending;
        
        return {
          _id: user._id,
          username: user.username,
          monthlySpending: user.monthlySpending,
          adjustedSpending: adjustedSpending,
          streakDays: user.streakDays,
          badges: user.badges,
          state: user.state
        };
      });
    
    // Sort by adjusted spending (lowest first)
    const sortedUsers = usersWithAdjustedSpending.sort((a, b) => 
      a.adjustedSpending - b.adjustedSpending
    );
    
    // Return top 10
    res.json(sortedUsers.slice(0, 10));
  } catch (error) {
    console.error("Global leaderboard error:", error);
    res.status(500).json({ error: "Failed to retrieve leaderboard." });
  }
});

// Get monthly leaderboard (lowest spenders, adjusted for cost of living)
router.get("/monthly", async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Aggregate expenses for the current month by user
    const monthlyLeaders = await Expense.aggregate([
      {
        $match: {
          date: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$amount" }
        }
      },
      // Only include users who have spent something
      {
        $match: {
          totalSpent: { $gt: 0 }
        }
      }
    ]);
    
    // Get user details for the leaders
    const userIds = monthlyLeaders.map(leader => mongoose.Types.ObjectId(leader._id));
    const users = await User.find({ _id: { $in: userIds } })
      .select("username monthlySpending badges state");
    
    // Combine the data and adjust for cost of living
    const leaderboard = monthlyLeaders.map(leader => {
      const user = users.find(u => u._id.toString() === leader._id.toString());
      
      if (!user) return null;
      
      const adjustedSpending = user.state ? 
        adjustSpendingForState(leader.totalSpent, user.state) : 
        leader.totalSpent;
      
      return {
        userId: leader._id,
        username: user.username,
        state: user.state || "Unknown",
        rawSpending: leader.totalSpent,
        adjustedSpending: adjustedSpending,
        costOfLivingIndex: getCostOfLivingIndex(user.state),
        badges: user.badges || []
      };
    }).filter(item => item !== null);
    
    // Sort by adjusted spending (lowest first)
    const sortedLeaderboard = leaderboard.sort((a, b) => 
      a.adjustedSpending - b.adjustedSpending
    );
    
    // Return top 10
    res.json(sortedLeaderboard.slice(0, 10));
  } catch (error) {
    console.error("Monthly leaderboard error:", error);
    res.status(500).json({ error: "Failed to retrieve monthly leaderboard." });
  }
});

// Get challenge leaderboard (lowest spenders, adjusted for cost of living)
router.get("/challenge/:challengeId", async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    const now = new Date();
    const startDate = challenge.startDate;
    
    // Get all participants
    const participants = await User.find({
      _id: { $in: challenge.participants }
    }).select("_id username badges state");
    
    // For each participant, calculate their spending during the challenge
    const leaderboardData = await Promise.all(participants.map(async (participant) => {
      const expenses = await Expense.find({
        userId: participant._id,
        date: { $gte: startDate, $lte: now }
      });
      
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Adjust spending based on state's cost of living
      const adjustedSpending = participant.state ? 
        adjustSpendingForState(totalSpent, participant.state) : 
        totalSpent;
      
      return {
        userId: participant._id,
        username: participant.username,
        state: participant.state || "Unknown",
        rawSpending: totalSpent,
        adjustedSpending: adjustedSpending,
        costOfLivingIndex: getCostOfLivingIndex(participant.state),
        badges: participant.badges
      };
    }));
    
    // Filter out participants with no expenses
    const filteredLeaderboard = leaderboardData.filter(participant => participant.rawSpending > 0);
    
    // Sort by adjusted spending (lowest first)
    const leaderboard = filteredLeaderboard.sort((a, b) => a.adjustedSpending - b.adjustedSpending);
    
    res.json(leaderboard);
  } catch (error) {
    console.error("Challenge leaderboard error:", error);
    res.status(500).json({ error: "Failed to retrieve challenge leaderboard." });
  }
});

// Get streak leaderboard (users with longest active streaks)
router.get("/streaks", async (req, res) => {
  try {
    const topStreaks = await User.find()
      .sort({ streakDays: -1 })
      .limit(10)
      .select("username streakDays totalSavings badges");
      
    res.json(topStreaks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve streak leaderboard." });
  }
});

// Update user's streak
router.post("/update-streak", async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const today = new Date();
    const lastActive = new Date(user.lastActive);
    
    // Check if last active was yesterday
    const isYesterday = 
      lastActive.getDate() === today.getDate() - 1 && 
      lastActive.getMonth() === today.getMonth() && 
      lastActive.getFullYear() === today.getFullYear();
    
    if (isYesterday) {
      // Increment streak
      user.streakDays += 1;
      
      // Award badges based on streak milestones
      if (user.streakDays === 7 && !user.badges.includes("Week Streak")) {
        user.badges.push("Week Streak");
      } else if (user.streakDays === 30 && !user.badges.includes("Month Streak")) {
        user.badges.push("Month Streak");
      } else if (user.streakDays === 100 && !user.badges.includes("100 Day Streak")) {
        user.badges.push("100 Day Streak");
      }
    } else if (!isToday(lastActive, today)) {
      // Reset streak if not yesterday and not today
      user.streakDays = 1;
    }
    
    // Update last active
    user.lastActive = today;
    await user.save();
    
    res.json({ 
      message: "Streak updated successfully",
      currentStreak: user.streakDays,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update streak." });
  }
});

// Helper function to check if date is today
function isToday(date1, date2) {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
}

// Update user's total savings (would typically be called after adding expenses)
router.post("/update-savings", async (req, res) => {
  try {
    const { userId, savingsAmount } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const amount = parseFloat(savingsAmount);
    user.totalSavings += amount;
    user.monthlyProgress += amount;
    
    // Award badges based on savings milestones
    if (user.totalSavings >= 100 && !user.badges.includes("Saver Starter")) {
      user.badges.push("Saver Starter");
    } else if (user.totalSavings >= 500 && !user.badges.includes("Saving Pro")) {
      user.badges.push("Saving Pro");
    } else if (user.totalSavings >= 1000 && !user.badges.includes("Saving Master")) {
      user.badges.push("Saving Master");
    }
    
    // Check if monthly goal is reached
    if (user.monthlyGoal > 0 && user.monthlyProgress >= user.monthlyGoal && 
        !user.badges.includes("Goal Achiever")) {
      user.badges.push("Goal Achiever");
    }
    
    await user.save();
    
    res.json({ 
      message: "Savings updated successfully",
      newTotal: user.totalSavings,
      monthlyProgress: user.monthlyProgress,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update savings." });
  }
});

// Set monthly budget
router.post("/set-budget", async (req, res) => {
  try {
    const { userId, budgetAmount } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.monthlyBudget = parseFloat(budgetAmount);
    
    // Reset monthly spending if it's a new month
    const now = new Date();
    const lastActiveMonth = new Date(user.lastActive).getMonth();
    
    if (now.getMonth() !== lastActiveMonth) {
      user.monthlySpending = 0;
    }
    
    // Update last active date
    user.lastActive = now;
    
    await user.save();
    
    res.json({ 
      message: "Monthly budget set successfully",
      monthlyBudget: user.monthlyBudget,
      monthlySpending: user.monthlySpending,
      budgetStatus: user.monthlyBudget > 0 
        ? `${((user.monthlySpending / user.monthlyBudget) * 100).toFixed(1)}%` 
        : "0%"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to set monthly budget." });
  }
});

// Get user stats and achievements
router.get("/user-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select("username state monthlySpending monthlyBudget streakDays badges joinDate challengesWon");
      
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Adjust spending based on state's cost of living
    const adjustedSpending = user.state ? 
      adjustSpendingForState(user.monthlySpending, user.state) : 
      user.monthlySpending;
    
    // Get user's rank in global leaderboard (by adjusted spending)
    // This is more complex now, so we need to get all users and sort them
    const allUsers = await User.find().select("_id monthlySpending state");
    
    const usersWithAdjustedSpending = allUsers.map(u => {
      return {
        _id: u._id,
        adjustedSpending: u.state ? 
          adjustSpendingForState(u.monthlySpending, u.state) : 
          u.monthlySpending
      };
    });
    
    // Sort by adjusted spending
    usersWithAdjustedSpending.sort((a, b) => a.adjustedSpending - b.adjustedSpending);
    
    // Find user's position in the sorted array
    const userRank = usersWithAdjustedSpending.findIndex(u => 
      u._id.toString() === userId
    ) + 1;
    
    // Get total challenges joined
    const challengesJoined = await Challenge.countDocuments({ participants: userId });
    
    // Calculate days since joining
    const daysSinceJoining = Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24));
    
    // Calculate budget status
    const budgetStatus = user.monthlyBudget > 0 
      ? ((user.monthlySpending / user.monthlyBudget) * 100).toFixed(1) 
      : 0;
    
    // Calculate budget remaining
    const budgetRemaining = Math.max(0, user.monthlyBudget - user.monthlySpending);
    
    res.json({
      username: user.username,
      state: user.state,
      costOfLivingIndex: getCostOfLivingIndex(user.state),
      monthlySpending: user.monthlySpending,
      adjustedSpending: adjustedSpending,
      monthlyBudget: user.monthlyBudget,
      budgetStatus: `${budgetStatus}%`,
      budgetRemaining: budgetRemaining,
      streakDays: user.streakDays,
      badges: user.badges,
      globalRank: userRank,
      challengesJoined: challengesJoined,
      challengesWon: user.challengesWon,
      daysSinceJoining: daysSinceJoining
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ error: "Failed to retrieve user stats." });
  }
});

// Get cost of living data for a state
router.get("/cost-of-living/:state", (req, res) => {
  try {
    const { state } = req.params;
    const costIndex = getCostOfLivingIndex(state.toUpperCase());
    
    res.json({
      state: state.toUpperCase(),
      costOfLivingIndex: costIndex,
      comparisonToNational: `${costIndex}% of national average`
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve cost of living data." });
  }
});

// Test adjusted spending
router.post("/test-adjusted-spending", (req, res) => {
  try {
    const { spending, state } = req.body;
    
    if (!spending || !state) {
      return res.status(400).json({ error: "Both spending and state are required" });
    }
    
    const rawSpending = parseFloat(spending);
    const adjustedSpending = adjustSpendingForState(rawSpending, state.toUpperCase());
    
    res.json({
      state: state.toUpperCase(),
      rawSpending: rawSpending,
      costOfLivingIndex: getCostOfLivingIndex(state.toUpperCase()),
      adjustedSpending: adjustedSpending,
      explanation: `$${rawSpending} in ${state.toUpperCase()} is equivalent to $${adjustedSpending.toFixed(2)} in a state with average cost of living`
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate adjusted spending." });
  }
});

// Debug endpoint to check loaded cost of living data
router.get("/debug/cost-of-living-data", (req, res) => {
  try {
    const { getCostOfLivingIndex } = require('../utils/costOfLiving');
    
    // Check a few states
    const states = ['NY', 'CA', 'TX', 'FL', 'IL'];
    const data = {};
    
    states.forEach(state => {
      data[state] = getCostOfLivingIndex(state);
    });
    
    // Get all loaded data
    const costOfLivingByState = require('../utils/costOfLiving').costOfLivingByState;
    const allData = Array.from(costOfLivingByState.entries()).map(([state, index]) => ({
      state,
      costIndex: index
    }));
    
    res.json({
      sampleData: data,
      loadedStates: costOfLivingByState.size,
      allData: allData
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ error: "Failed to retrieve debug data." });
  }
});

// Get leaderboard data by time frame (week, month, year, all)
router.get("/:timeFrame", auth, async (req, res) => {
  try {
    console.log(`Leaderboard request for timeFrame: ${req.params.timeFrame}`);
    
    // Get time frame from request parameters
    const { timeFrame } = req.params;
    
    // Define date range based on time frame
    const now = new Date();
    let startDate;
    
    switch (timeFrame) {
      case 'week':
        // Start date is 7 days ago
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Start date is first day of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        // Start date is first day of current year
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        // No start date filter for all-time
        startDate = new Date(0); // January 1, 1970
        break;
    }
    
    console.log(`Fetching leaderboard data from ${startDate.toISOString()} to now`);
    
    // Get users sorted by points (could be based on savings, streak, etc.)
    const users = await User.find({})
      .select('username streak monthlyIncome monthlySpending savingsGoal')
      .sort({ streak: -1 }) // Sort by streak descending
      .limit(20); // Limit to top 20 users
    
    // Transform user data for leaderboard
    const leaderboardData = users.map(user => {
      // Calculate points based on your business logic
      // Example: points = streak * 50 + (monthlyIncome - monthlySpending) / 10
      const savings = user.monthlyIncome - user.monthlySpending;
      const savingsPercentage = user.monthlyIncome > 0 ? (savings / user.monthlyIncome) * 100 : 0;
      const points = Math.round(user.streak * 50 + savingsPercentage * 10);
      
      return {
        username: user.username,
        points: Math.max(0, points), // Ensure points are not negative
        streak: user.streak || 0
      };
    });
    
    // Sort by points
    leaderboardData.sort((a, b) => b.points - a.points);
    
    console.log(`Returning ${leaderboardData.length} users for leaderboard`);
    res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

module.exports = router; 