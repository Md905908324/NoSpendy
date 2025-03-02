const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isCompleted: { type: Boolean, default: false },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, default: "General" },
  leaderboard: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    spending: { type: Number, default: 0 }
  }]
});

// Calculate end date before saving
challengeSchema.pre("save", function(next) {
  if (this.isNew || this.isModified("startDate") || this.isModified("duration")) {
    const startDate = new Date(this.startDate);
    this.endDate = new Date(startDate.setDate(startDate.getDate() + this.duration));
  }
  next();
});

module.exports = mongoose.model("Challenge", challengeSchema); 