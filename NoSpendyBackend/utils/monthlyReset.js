const User = require('../models/user');

// Function to reset monthly spending for all users
async function resetMonthlySpending() {
  try {
    // Reset monthly spending
    await User.updateMany({}, { $set: { monthlySpending: 0 } });
    
    // Remove daily expenses older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await User.updateMany(
      {}, 
      { $pull: { dailyExpenses: { date: { $lt: thirtyDaysAgo } } } }
    );
    
    console.log('Monthly spending reset for all users');
  } catch (error) {
    console.error('Error resetting monthly spending:', error);
  }
}

module.exports = { resetMonthlySpending }; 