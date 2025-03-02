import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/leaderboard.css";
import API from "../utils/api";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("month"); // Default to monthly view
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Add detailed logging for debugging
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      console.log("Fetching leaderboard data...");
      console.log("Current user:", currentUser ? { ...currentUser, token: "HIDDEN" } : "No user");
      console.log("Selected time frame:", timeFrame);
      
      if (!currentUser) {
        console.log("No current user, redirecting to signin");
        navigate("/signin");
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Making API request to /leaderboard/${timeFrame}`);
        
        // Uncomment the API call and remove the sample data fallback
        const response = await API.get(`/leaderboard/${timeFrame}`);
        console.log("Leaderboard API response:", response.status, response.data);
        setLeaderboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        console.error("Error details:", err.response ? err.response.data : err.message);
        
        // Set error message and use sample data as fallback
        setError("Failed to load leaderboard data. Using sample data instead.");
        setLeaderboardData(getSampleLeaderboardData());
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [currentUser, timeFrame, navigate]);

  // Navigation handlers
  const handleDashboardClick = () => {
    console.log("Navigating to dashboard");
    navigate('/dashboard');
  };
  
  const handleSpendingHistoryClick = () => {
    console.log("Navigating to spending history");
    navigate('/spendinghistory');
  };
  
  const handleLogExpensesClick = () => {
    console.log("Navigating to expenses");
    navigate('/expenses');
  };
  
  const handleChallengesClick = () => {
    console.log("Navigating to challenges");
    navigate('/expenses');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Update the time period handler to use the correct endpoints
  const handleTimeFrameChange = (newTimeFrame) => {
    console.log("Changing time frame to:", newTimeFrame);
    setTimeFrame(newTimeFrame);
  };

  // Sample data for fallback
  const getSampleLeaderboardData = () => {
    console.log("Using sample leaderboard data");
    return [
      { username: "SavingQueen", points: 1250, streak: 15 },
      { username: "BudgetMaster", points: 1100, streak: 12 },
      { username: "FrugalFriend", points: 950, streak: 10 },
      { username: "PennyWise", points: 820, streak: 8 },
      { username: "SaverSam", points: 780, streak: 7 },
      { username: "ThriftyTom", points: 650, streak: 6 },
      { username: "EconomyEmma", points: 600, streak: 5 },
      { username: "BargainBob", points: 550, streak: 4 },
      { username: "NoSpendyNancy", points: 500, streak: 3 },
      { username: "CouponCarl", points: 450, streak: 2 }
    ];
  };

  // Add this function to filter users by search query
  const filteredLeaderboardData = leaderboardData.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add this function to handle sign out
  const handleSignOut = async () => {
    console.log("Sign out initiated from leaderboard");
    localStorage.removeItem('user');
    navigate('/signin');
  };

  // Add this function to toggle the profile menu
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/signin");
    return null;
  }

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
            <li onClick={handleLogExpensesClick}>Log Expenses</li>
            <li onClick={handleChallengesClick}>Challenges</li>
            <li className="active">Leaderboard</li>
            <li onClick={handleSettingsClick}>Settings</li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Leaderboard</h1>
          <div className="topbar__search">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="profile-container">
              <button className="profile-btn" onClick={toggleProfileMenu}>
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/profile_icon.png`} 
                  alt="Profile" 
                  className="profile-img" 
                />
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-item">
                    <span>{currentUser.username || 'User'}</span>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <div className="profile-dropdown-item" onClick={handleSignOut}>
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>Top Savers This Month</h2>
            <div className="time-period-selector">
              <button 
                className={timeFrame === 'week' ? 'active' : ''} 
                onClick={() => handleTimeFrameChange('week')}
              >
                This Week
              </button>
              <button 
                className={timeFrame === 'month' ? 'active' : ''} 
                onClick={() => handleTimeFrameChange('month')}
              >
                This Month
              </button>
              <button 
                className={timeFrame === 'year' ? 'active' : ''} 
                onClick={() => handleTimeFrameChange('year')}
              >
                This Year
              </button>
              <button 
                className={timeFrame === 'all' ? 'active' : ''} 
                onClick={() => handleTimeFrameChange('all')}
              >
                All Time
              </button>
            </div>
          </div>
          
          {loading ? (
            <p className="loading-message">Loading leaderboard data...</p>
          ) : error ? (
            <div className="error-message">
              {error}
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Points</th>
                      <th>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboardData.map((user, index) => {
                      // Check if the user object has the expected structure
                      const username = user.username;
                      const points = user.points || user.adjustedSpending || 0;
                      const streak = user.streakDays || user.streak || 0;
                      const rank = user.rank || index + 1;
                      
                      return (
                        <tr key={index} className={username === currentUser.username ? "current-user" : ""}>
                          <td className="rank">{rank}</td>
                          <td className="username">{username}</td>
                          <td className="points">{typeof points === 'number' ? points.toFixed(0) : points}</td>
                          <td className="streak">{streak} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="leaderboard-table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Points</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboardData.map((user, index) => {
                    // Check if the user object has the expected structure
                    const username = user.username;
                    const points = user.points || user.adjustedSpending || 0;
                    const streak = user.streakDays || user.streak || 0;
                    const rank = user.rank || index + 1;
                    
                    return (
                      <tr key={index} className={username === currentUser.username ? "current-user" : ""}>
                        <td className="rank">{rank}</td>
                        <td className="username">{username}</td>
                        <td className="points">{typeof points === 'number' ? points.toFixed(0) : points}</td>
                        <td className="streak">{streak} days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard; 