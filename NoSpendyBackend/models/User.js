const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define a schema for daily expenses
const dailyExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  state: { type: String, default: "" },
  monthlySpending: { type: Number, default: 0 },
  monthlyBudget: { type: Number, default: 0 },
  challengesJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
  challengesWon: { type: Number, default: 0 },
  streak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastActive: { type: Date, default: Date.now },
  badges: [String],
  joinDate: { type: Date, default: Date.now },
  location: {
    type: String,
    default: ""
  },
  monthlyIncome: {
    type: Number,
    default: 0
  },
  savingsGoal: {
    type: Number,
    default: 0
  },
  // Add daily expense tracking
  dailyExpenses: [dailyExpenseSchema]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;