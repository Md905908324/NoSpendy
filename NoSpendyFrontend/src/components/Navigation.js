import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/dashboard">NoSpendy</Link>
      </div>
      
      {currentUser && (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/expenses">Log Expenses</Link>
          <Link to="/spendinghistory">Spending History</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 