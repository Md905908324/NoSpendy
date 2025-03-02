import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API from "../utils/api";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    spendingChallenge: 0,
    spentThisMonth: 0,
    streak: 0,
    loading: true,
    error: null
  });
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    amounts: [],
    backgroundColors: []
  });
  const [userRank, setUserRank] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [topSavers, setTopSavers] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Navigation handlers
  const handleSpendingHistoryClick = () => {
    navigate('/spendinghistory');
  };
  
  const handleLogExpensesClick = () => {
    navigate('/expenses');
  };
  
  const handleChallengesClick = () => {
    navigate('/expenses');
    // This will navigate to expenses page with challenge tab active
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  const handleSignOut = async () => {
    console.log("Sign out initiated");
    try {
      await logout();
      console.log("Logout successful, navigating to signin page");
      navigate('/signin');
    } catch (error) {
      console.error("Error during logout:", error);
      // Force navigation to signin even if logout fails
      navigate('/signin');
    }
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
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

  // Prepare data for the monthly spending chart
  const prepareMonthlyChartData = (expenses) => {
    // Create an array for all 12 months of the current year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const allMonths = monthNames.map(month => `${month}`);
    
    // Initialize amounts for all months to 0
    const monthlyAmounts = new Array(12).fill(0);
    
    // Group expenses by month
    if (expenses && expenses.length > 0) {
      expenses.forEach(expense => {
        try {
          const date = new Date(expense.createdAt || expense.date);
          // Only include expenses from current year and valid dates
          if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth();
            monthlyAmounts[monthIndex] += expense.amount;
          }
        } catch (error) {
          console.error("Error processing expense date:", error, expense);
        }
      });
    }
    
    // Get current month index for highlighting
    const currentMonthIndex = new Date().getMonth();
    
    // Create background colors array with current month highlighted
    const backgroundColors = monthlyAmounts.map((_, index) => 
      index === currentMonthIndex ? '#4caf50' : '#e0e0e0'
    );
    
    // Add some sample data if no real data exists (for testing)
    if (monthlyAmounts.every(amount => amount === 0)) {
      monthlyAmounts[currentMonthIndex] = 100;
      monthlyAmounts[(currentMonthIndex + 1) % 12] = 50;
      monthlyAmounts[(currentMonthIndex + 2) % 12] = 75;
    }
    
    setMonthlyData({
      labels: allMonths,
      amounts: monthlyAmounts,
      backgroundColors: backgroundColors
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get monthly expenses
        const monthlyResponse = await axios.get('/expenses/monthly', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });

        // Get all expenses for total
        const allExpensesResponse = await axios.get('/expenses/all', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });

        // Get user profile for savings goal and streak
        const userProfileResponse = await axios.get('/users/profile', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });

        // Calculate total expenses
        const totalExpenses = allExpensesResponse.data.reduce(
          (sum, expense) => sum + expense.amount, 
          0
        );

        // Get monthly spending
        const spentThisMonth = monthlyResponse.data.totalSpent || 0;

        // Get user's savings goal (spending challenge)
        const spendingChallenge = userProfileResponse.data.savingsGoal || 0;

        // Get user's streak
        const streak = userProfileResponse.data.streak || 0;

        // Set expenses for history section
        setExpenses(allExpensesResponse.data);
        setExpensesLoading(false);

        // Prepare data for the monthly spending chart
        prepareMonthlyChartData(allExpensesResponse.data);

        setDashboardData({
          totalExpenses,
          spendingChallenge,
          spentThisMonth,
          streak,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard data"
        }));
        setExpensesLoading(false);
        
        // Still prepare some sample chart data even if there's an error
        prepareMonthlyChartData([]);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!currentUser) return;
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        };
        
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users/me/rank`, 
            config
          );
          setUserRank(response.data.rank);
        } catch (apiError) {
          // Try fallback URL
          const fallbackResponse = await axios.get('/api/users/me/rank', config);
          setUserRank(fallbackResponse.data.rank);
        }
      } catch (err) {
        console.error("Error fetching user rank:", err);
        // Set a default rank for demo purposes
        setUserRank(Math.floor(Math.random() * 10) + 1);
      }
    };

    fetchUserRank();
  }, [currentUser]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLeaderboardLoading(true);
        // Fetch top savers from the leaderboard API
        const response = await API.get('/leaderboard/month');
        console.log("Dashboard leaderboard data:", response.data);
        
        // Take only the top 3 for the dashboard display
        setTopSavers(response.data.slice(0, 3));
        setLeaderboardLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard for dashboard:", err);
        // Fallback to sample data if API fails
        setTopSavers([
          { username: "SavingQueen", points: 1250, streak: 15 },
          { username: "BudgetMaster", points: 1100, streak: 12 },
          { username: "FrugalFriend", points: 950, streak: 10 }
        ]);
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [currentUser]);

  // Chart configuration
  const chartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlyData.amounts,
        backgroundColor: monthlyData.backgroundColors || Array(12).fill('#e0e0e0'),
        borderColor: monthlyData.backgroundColors 
          ? monthlyData.backgroundColors.map(color => color === '#4caf50' ? '#388e3c' : '#bdbdbd')
          : Array(12).fill('#bdbdbd'),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Overview',
        align: 'start',
        font: {
          size: 24,
          weight: 'bold'
        },
        padding: {
          bottom: 30
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `from ${context.raw} $`;
          }
        },
        backgroundColor: '#a5d68a',
        titleColor: '#000',
        bodyColor: '#000',
        borderWidth: 0,
        cornerRadius: 8,
        displayColors: false,
        padding: 12
      }
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true
      },
      x: {
        grid: {
          display: true,
          drawBorder: false,
          lineWidth: 1,
          drawTicks: false
        },
        ticks: {
          padding: 10,
          font: {
            size: 14
          }
        }
      }
    }
  };

  if (dashboardData.loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
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
            <li className="active">Dashboard</li>
            <li onClick={handleSpendingHistoryClick}>History</li>
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
          <h1>Dashboard</h1>
          <div className="topbar__search">
            <input type="text" placeholder="Search..." />
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

        {/* Stats cards */}
        <section className="top-stats">
          <div className="stat-card">
            <h3>Total Expenses</h3>
            <p className="stat-amount">${dashboardData.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Spending Challenge</h3>
            <p className="stat-amount">${dashboardData.spendingChallenge.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Spent This Month</h3>
            <p className="stat-amount">${dashboardData.spentThisMonth.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Streak</h3>
            <p className="stat-amount">{dashboardData.streak} Days</p>
          </div>
          <div className="stat-card">
            <h3>Your Rank</h3>
            <p className="stat-amount">#{userRank || '-'}</p>
          </div>
        </section>

        {/* Spending Chart Section */}
        <div className="spending-chart-section">
          <h2>Spending Overview</h2>
          <div className="chart-container">
            {monthlyData.labels.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="no-data-message">Not enough data to display chart</p>
            )}
          </div>
        </div>

        {/* Top Savers Section */}
        <div className="dashboard-card">
          <h2>Top Savers</h2>
          {leaderboardLoading ? (
            <p>Loading top savers...</p>
          ) : (
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
                {topSavers.map((saver, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{saver.username}</td>
                    <td>{saver.points}</td>
                    <td>{saver.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/leaderboard')}
          >
            View Full Leaderboard
          </button>
        </div>

        {/* Spending History Section */}
        <div className="spending-history-section">
          <h2>Spending History</h2>
          
          {expensesLoading ? (
            <p>Loading expense history...</p>
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
                    <tr key={expense._id}>
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
        
        <div className="dashboard-actions">
          <Link to="/expenses" className="action-button">
            Log New Expense
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
