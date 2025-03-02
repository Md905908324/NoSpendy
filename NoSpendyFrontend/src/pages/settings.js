import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import '../styles/settings.css';

const Settings = () => {
  const { currentUser } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Navigation handlers
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  
  const handleSpendingHistoryClick = () => {
    navigate('/spendinghistory');
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
            <li onClick={handleLeaderboardClick}>Leaderboard</li>
            <li className="active">Settings</li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Settings</h1>
          <div className="topbar__search">
            <input type="text" placeholder="Search..." />
          </div>
        </header>

        <div className="settings-container">
          <div className="settings-card">
            <h2>Appearance</h2>
            <div className="settings-option">
              <div className="settings-option-label">
                <span>Dark Mode</span>
                <p className="settings-option-description">Switch between light and dark theme</p>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="dark-mode-toggle" 
                  checked={darkMode} 
                  onChange={toggleDarkMode} 
                />
                <label htmlFor="dark-mode-toggle"></label>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h2>Account Settings</h2>
            <div className="settings-option">
              <div className="settings-option-label">
                <span>Email</span>
                <p className="settings-option-description">{currentUser?.email || 'No email set'}</p>
              </div>
              <button className="settings-btn">Change</button>
            </div>
            <div className="settings-option">
              <div className="settings-option-label">
                <span>Password</span>
                <p className="settings-option-description">Last changed: Never</p>
              </div>
              <button className="settings-btn">Change</button>
            </div>
          </div>

          <div className="settings-card">
            <h2>Notifications</h2>
            <div className="settings-option">
              <div className="settings-option-label">
                <span>Email Notifications</span>
                <p className="settings-option-description">Receive email updates about your account</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="email-notifications" />
                <label htmlFor="email-notifications"></label>
              </div>
            </div>
            <div className="settings-option">
              <div className="settings-option-label">
                <span>Budget Alerts</span>
                <p className="settings-option-description">Get notified when you're close to your budget limit</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="budget-alerts" defaultChecked />
                <label htmlFor="budget-alerts"></label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 