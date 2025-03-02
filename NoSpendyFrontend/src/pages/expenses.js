import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/expenses.css";
import axios from "axios";

const Expenses = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [expenses, setExpenses] = useState({
    food: "",
    transportation: "",
    entertainment: "",
    essentials: "",
  });
  const [challenge, setChallenge] = useState({
    amount: "",
    duration: "1 Week"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("expenses"); // "expenses" or "challenge"

  // Navigation handlers
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  
  const handleSpendingHistoryClick = () => {
    navigate('/dashboard'); // For now, navigate to dashboard since history is there
  };
  
  const handleChallengesClick = () => {
    setActiveTab("challenge");
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  const handleChange = (e) => {
    setExpenses({ ...expenses, [e.target.name]: e.target.value });
  };

  const handleChallengeChange = (e) => {
    setChallenge({ ...challenge, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    // Create individual expense entries for each category
    const createExpensePromises = [];
    
    // Configure axios with auth header
    const config = {
      headers: {
        Authorization: `Bearer ${currentUser.token}`
      }
    };
    
    if (expenses.food && parseFloat(expenses.food) > 0) {
      createExpensePromises.push(
        axios.post('/expenses/add', {
          amount: parseFloat(expenses.food),
          category: "Food",
          description: "Food expense"
        }, config)
      );
    }
    
    if (expenses.transportation && parseFloat(expenses.transportation) > 0) {
      createExpensePromises.push(
        axios.post('/expenses/add', {
          amount: parseFloat(expenses.transportation),
          category: "Transportation",
          description: "Transportation expense"
        }, config)
      );
    }
    
    if (expenses.entertainment && parseFloat(expenses.entertainment) > 0) {
      createExpensePromises.push(
        axios.post('/expenses/add', {
          amount: parseFloat(expenses.entertainment),
          category: "Entertainment",
          description: "Entertainment expense"
        }, config)
      );
    }
    
    if (expenses.essentials && parseFloat(expenses.essentials) > 0) {
      createExpensePromises.push(
        axios.post('/expenses/add', {
          amount: parseFloat(expenses.essentials),
          category: "Essentials",
          description: "Essential expense"
        }, config)
      );
    }
    
    if (createExpensePromises.length === 0) {
      setError("Please enter at least one expense amount");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Submit all expenses
      await Promise.all(createExpensePromises);
      
      // Reset form
      setExpenses({
        food: "",
        transportation: "",
        entertainment: "",
        essentials: ""
      });
      
      // Show success message or redirect
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding expenses:", error);
      setError("Failed to add expenses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    if (!challenge.amount || parseFloat(challenge.amount) <= 0) {
      setError("Please enter a valid challenge amount");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Configure axios with auth header
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      };
      
      // Submit challenge
      await axios.post('/users/challenge', {
        amount: parseFloat(challenge.amount),
        duration: challenge.duration
      }, config);
      
      // Reset form
      setChallenge({
        amount: "",
        duration: "1 Week"
      });
      
      // Show success message or redirect
      navigate("/dashboard");
    } catch (error) {
      console.error("Error setting challenge:", error);
      setError("Failed to set challenge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src={`${process.env.PUBLIC_URL}/assets/piggyBankIcon.png`} alt="NoSpendy Logo" className="logo" />
          <h2>NoSpendy</h2>
        </div>
        <div className="sidebar__menu">
          <ul>
            <li onClick={handleDashboardClick}>Dashboard</li>
            <li onClick={handleSpendingHistoryClick}>History</li>
            <li className="active">Log Expenses</li>
            <li onClick={handleChallengesClick}>Challenges</li>
            <li onClick={handleLeaderboardClick}>Leaderboard</li>
            <li onClick={handleSettingsClick}>Settings</li>
          </ul>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <h1>Manage Expenses</h1>
          <div className="topbar__search">
            <input type="text" placeholder="Search" />
            <button className="profile-btn">
              <img
                src={`${process.env.PUBLIC_URL}/assets/profile_icon.png`}
                alt="Profile"
                className="profile-img"
              />
            </button>
          </div>
        </header>
        
        <div className="tabs">
          <button 
            className={activeTab === "expenses" ? "tab-active" : ""} 
            onClick={() => setActiveTab("expenses")}
          >
            Log Expenses
          </button>
          <button 
            className={activeTab === "challenge" ? "tab-active" : ""} 
            onClick={() => setActiveTab("challenge")}
          >
            Set Challenge
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        {activeTab === "expenses" ? (
          <div className="expense-form-container">
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label>Food</label>
                <input 
                  type="number" 
                  name="food" 
                  value={expenses.food} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Transportation</label>
                <input 
                  type="number" 
                  name="transportation" 
                  value={expenses.transportation} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Entertainment</label>
                <input 
                  type="number" 
                  name="entertainment" 
                  value={expenses.entertainment} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Essentials</label>
                <input 
                  type="number" 
                  name="essentials" 
                  value={expenses.essentials} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Expenses"}
              </button>
            </form>
          </div>
        ) : (
          <div className="challenge-container">
            <form onSubmit={handleChallengeSubmit} className="challenge-form">
              <h2>SET CHALLENGE:</h2>
              
              <div className="form-group">
                <label>Amount:</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={challenge.amount} 
                  onChange={handleChallengeChange} 
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Duration:</label>
                <select 
                  name="duration" 
                  value={challenge.duration} 
                  onChange={handleChallengeChange}
                >
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="challenge-button" 
                disabled={isSubmitting}
              >
                Set Challenge
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Expenses;
