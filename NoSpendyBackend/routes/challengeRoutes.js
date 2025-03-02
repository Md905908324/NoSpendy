const express = require("express");
const router = express.Router();
const Challenge = require("../models/Challenge");
const User = require("../models/user");
const Expense = require("../models/expense");

// Create a new challenge
router.post("/create", async (req, res) => {
  try {
    const { name, description, targetAmount, duration, createdBy } = req.body;
    
    const newChallenge = new Challenge({
      name,
      description,
      targetAmount,
      duration,
      createdBy,
      participants: [createdBy] // Creator automatically joins the challenge
    });
    
    await newChallenge.save();
    
    // Update the user's challengesJoined array
    await User.findByIdAndUpdate(
      createdBy,
      { $push: { challengesJoined: newChallenge._id } }
    );
    
    res.json({ 
      message: "Challenge created successfully!",
      challengeId: newChallenge._id
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Failed to create challenge." });
  }
});

// Get all challenges
router.get("/all", async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ startDate: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve challenges." });
  }
});

// Get challenge by ID
router.get("/:challengeId", async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId)
      .populate("participants", "username totalSavings")
      .populate("createdBy", "username");
      
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve challenge." });
  }
});

// Join a challenge
router.post("/join", async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    
    // Check if user is already in the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    if (challenge.participants.includes(userId)) {
      return res.status(400).json({ error: "User already joined this challenge" });
    }
    
    // Add user to challenge participants
    await Challenge.findByIdAndUpdate(
      challengeId,
      { $push: { participants: userId } }
    );
    
    // Add challenge to user's joined challenges
    await User.findByIdAndUpdate(
      userId,
      { $push: { challengesJoined: challengeId } }
    );
    
    res.json({ message: "Successfully joined the challenge!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to join challenge." });
  }
});

// Get challenges for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const challenges = await Challenge.find({
      participants: userId
    }).sort({ startDate: -1 });
    
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user challenges." });
  }
});

// Complete a challenge and determine winner
router.post("/complete/:challengeId", async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    if (challenge.isCompleted) {
      return res.status(400).json({ error: "Challenge already completed" });
    }
    
    // Check if challenge end date has passed
    const now = new Date();
    if (now < challenge.endDate) {
      return res.status(400).json({ 
        error: "Challenge is not yet complete", 
        daysRemaining: Math.ceil((challenge.endDate - now) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Get all participants with their spending during the challenge
    const participants = await User.find({
      _id: { $in: challenge.participants }
    }).select("_id username state");
    
    // Calculate spending for each participant during the challenge period
    const participantsWithSpending = await Promise.all(participants.map(async (participant) => {
      const expenses = await Expense.find({
        userId: participant._id,
        date: { $gte: challenge.startDate, $lte: challenge.endDate }
      });
      
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Adjust spending based on state's cost of living
      const adjustedSpending = participant.state ? 
        adjustSpendingForState(totalSpent, participant.state) : 
        totalSpent;
      
      return {
        _id: participant._id,
        username: participant.username,
        state: participant.state || "Unknown",
        rawSpending: totalSpent,
        adjustedSpending: adjustedSpending
      };
    }));
    
    // Determine winner (participant with lowest adjusted spending)
    let winner = null;
    let lowestAdjustedSpending = Infinity;
    
    for (const participant of participantsWithSpending) {
      if (participant.adjustedSpending < lowestAdjustedSpending) {
        lowestAdjustedSpending = participant.adjustedSpending;
        winner = participant;
      }
    }
    
    // Update challenge with winner
    challenge.isCompleted = true;
    if (winner) {
      challenge.winner = winner._id;
      
      // Update winner's stats
      await User.findByIdAndUpdate(winner._id, {
        $inc: { challengesWon: 1 },
        $push: { badges: "Frugal Champion" }
      });
    }
    
    await challenge.save();
    
    res.json({
      message: "Challenge completed successfully",
      winner: winner ? {
        userId: winner._id,
        username: winner.username,
        state: winner.state,
        rawSpending: winner.rawSpending,
        adjustedSpending: winner.adjustedSpending
      } : null
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ error: "Failed to complete challenge." });
  }
});

module.exports = router; 