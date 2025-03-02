const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { resetMonthlySpending } = require('./utils/monthlyReset');
const { loadCostOfLivingData } = require('./utils/costOfLiving');

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Your React app's address
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

// Use the routes
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/challenges", challengeRoutes);
app.use("/leaderboard", leaderboardRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Backend is up and running!");
});

// Schedule monthly reset (check daily if it's the first day of the month)
const checkAndResetMonthly = () => {
  const now = new Date();
  if (now.getDate() === 1) {
    // It's the first day of the month
    resetMonthlySpending();
  }
};

// Check once a day
setInterval(checkAndResetMonthly, 24 * 60 * 60 * 1000);
// Also check at startup
checkAndResetMonthly();

// Define server variable in the global scope
let server;

// Modify the server initialization to load cost of living data first
const PORT = process.env.PORT || 5000;

// Load cost of living data before starting the server
loadCostOfLivingData()
  .then((data) => {
    console.log(`Cost of living data loaded successfully for ${data.size} states`);
    
    // Start the server after data is loaded
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
        const newPort = PORT + 1;
        server = app.listen(newPort, () => {
          console.log(`Server running on port ${newPort}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to load cost of living data:', err);
    console.log('Starting server without cost of living data...');
    
    // Start the server even if data loading fails
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
        const newPort = PORT + 1;
        server = app.listen(newPort, () => {
          console.log(`Server running on port ${newPort}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  });

// Export for testing
module.exports = { app, server };

// Add this line near the top of your server.js file
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in environment variables. Using a default secret for development.');
  process.env.JWT_SECRET = 'your-default-secret-for-development-only';
}