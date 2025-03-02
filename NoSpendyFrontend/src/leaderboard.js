import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./leaderboard.css";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Navigation handlers
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  
  const handleHistoryClick = () => {
    navigate('/spendinghistory');
  };
  
  const handleLogExpensesClick = () => {
    navigate('/expenses');
  };
  
  const handleChallengesClick = () => {
    navigate('/expenses');
  };

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Configure axios with auth header
        const config = {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        };
        
        // Use the correct endpoint based on the selected time period
        let endpoint;
        if (timePeriod === 'month') {
          endpoint = '/api/leaderboard/monthly';
        } else if (timePeriod === 'global' || timePeriod === 'all') {
          endpoint = '/api/leaderboard/global';
        } else {
          // Default to monthly if we don't have a specific endpoint
          endpoint = '/api/leaderboard/monthly';
        }
        
        try {
          // Try with environment variable first
          const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, config);
          setLeaderboardData(response.data);
        } catch (apiError) {
          console.log(`First API attempt failed (${endpoint}), trying relative URL`);
          // Try with relative URL as fallback
          const fallbackResponse = await axios.get(endpoint, config);
          setLeaderboardData(fallbackResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data. Using sample data instead.");
        
        // Provide mock data as fallback
        const mockData = generateMockDataForPeriod(timePeriod);
        setLeaderboardData(mockData);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser, timePeriod]); // Add timePeriod as dependency

  // Update the time period handler to use the correct endpoints
  const handleTimePeriodChange = async (period) => {
    setTimePeriod(period);
    setLoading(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      };
      
      // Map the UI period to the correct API endpoint
      let endpoint;
      if (period === 'month') {
        endpoint = '/api/leaderboard/monthly';
      } else if (period === 'global' || period === 'all') {
        endpoint = '/api/leaderboard/global';
      } else {
        // Default to monthly if we don't have a specific endpoint
        endpoint = '/api/leaderboard/monthly';
      }
      
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}${endpoint}`, 
          config
        );
        setLeaderboardData(response.data);
      } catch (apiError) {
        // Try fallback URL
        const fallbackResponse = await axios.get(endpoint, config);
        setLeaderboardData(fallbackResponse.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${period} leaderboard:`, err);
      setError(`Failed to load ${period} leaderboard data. Using sample data.`);
      
      // Generate mock data based on the time period
      const mockData = generateMockDataForPeriod(period);
      setLeaderboardData(mockData);
      setLoading(false);
    }
  };

  // Helper function to generate mock data based on time period
  const generateMockDataForPeriod = (period) => {
    // Base mock data
    const baseMockData = [
      { username: "SavingQueen", points: 1250, rank: 1, streak: 15 },
      { username: "BudgetMaster", points: 1100, rank: 2, streak: 12 },
      { username: "FrugalFriend", points: 950, rank: 3, streak: 10 },
      { username: "PennyWise", points: 820, rank: 4, streak: 8 },
      { username: "SaverSam", points: 780, rank: 5, streak: 7 },
      { username: "ThriftyTom", points: 650, rank: 6, streak: 6 },
      { username: "EconomyEmma", points: 600, rank: 7, streak: 5 },
      { username: "BargainBob", points: 550, rank: 8, streak: 4 },
      { username: "NoSpendyNancy", points: 500, rank: 9, streak: 3 },
      { username: "CouponCarl", points: 450, rank: 10, streak: 2 }
    ];
    
    // Adjust points based on period
    const multiplier = period === 'week' ? 0.3 : 
                      period === 'month' ? 1 : 
                      period === 'year' ? 3 : 5;
    
    return baseMockData.map(user => ({
      ...user,
      points: Math.round(user.points * multiplier)
    }));
  };

  // Add this function to filter users by search query
  const filteredLeaderboardData = leaderboardData.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add this function to handle sign out
  const handleSignOut = () => {
    // Clear the user from context/local storage
    localStorage.removeItem('user');
    // Redirect to sign in page
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
          <img src={`${process.env.PUBLIC_URL}/piggyBankIcon.png`} alt="NoSpendy Logo" className="logo" />
          <h2>NoSpendy</h2>
        </div>
        <div className="sidebar__menu">
          <ul>
            <li onClick={handleDashboardClick}>Dashboard</li>
            <li onClick={handleHistoryClick}>History</li>
            <li onClick={handleLogExpensesClick}>Log Expenses</li>
            <li onClick={handleChallengesClick}>Challenges</li>
            <li className="active">Leaderboard</li>
            <li>Overview</li>
            <li>Notifications</li>
            <li>Settings</li>
            <li>Security</li>
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
                  src={`${process.env.PUBLIC_URL}/profile_icon.png`} 
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
                className={timePeriod === 'week' ? 'active' : ''} 
                onClick={() => handleTimePeriodChange('week')}
              >
                This Week
              </button>
              <button 
                className={timePeriod === 'month' ? 'active' : ''} 
                onClick={() => handleTimePeriodChange('month')}
              >
                This Month
              </button>
              <button 
                className={timePeriod === 'year' ? 'active' : ''} 
                onClick={() => handleTimePeriodChange('year')}
              >
                This Year
              </button>
              <button 
                className={timePeriod === 'all' ? 'active' : ''} 
                onClick={() => handleTimePeriodChange('all')}
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