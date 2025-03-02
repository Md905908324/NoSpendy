import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./spendinghistory.css";

const SpendingHistory = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation handlers
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  
  const handleLogExpensesClick = () => {
    navigate('/expenses');
  };
  
  const handleChallengesClick = () => {
    navigate('/expenses');
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Error formatting date';
    }
  };

  // Fetch expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Configure axios with auth header
        const config = {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        };
        
        const response = await axios.get('/expenses/all', config);
        setExpenses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Failed to load expense history. Please try again later.");
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentUser]);

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src={`${process.env.PUBLIC_URL}/piggyBankIcon.png`} alt="NoSpendy Logo" className="logo" />
          <h2>NoSpendy</h2>
        </div>
        <div className="sidebar__menu">
          <ul>
            <li onClick={handleDashboardClick}>Dashboard</li>
            <li className="active">History</li>
            <li onClick={handleLogExpensesClick}>Log Expenses</li>
            <li onClick={handleChallengesClick}>Challenges</li>
            <li onClick={handleLeaderboardClick}>Leaderboard</li>
            <li>Overview</li>
            <li>Notifications</li>
            <li>Settings</li>
            <li>Security</li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>History</h1>
          <div className="topbar__search">
            <input type="text" placeholder="Search..." />
            <button className="profile-btn">
              <img 
                src={`${process.env.PUBLIC_URL}/profile_icon.png`} 
                alt="Profile" 
                className="profile-img" 
              />
            </button>
          </div>
        </header>

        {/* Spending History Section */}
        <div className="spending-history-section">
          <h2>All Expenses</h2>
          
          {loading ? (
            <p>Loading expense history...</p>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : expenses.length === 0 ? (
            <div className="no-expenses">
              <p>No expenses recorded yet.</p>
              <Link to="/expenses" className="action-button">Log Your First Expense</Link>
            </div>
          ) : (
            <div className="expense-history">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense._id || Math.random().toString()}>
                      <td>{formatDate(expense.createdAt || expense.date)}</td>
                      <td>{expense.category}</td>
                      <td>{expense.description || '-'}</td>
                      <td className="amount">${expense.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SpendingHistory;
