import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import piggyBankIcon from "./piggyBankIcon.png"; 






const Dashboard = () => {
    const navigate = useNavigate();
    const handleSpendingHistoryClick = () => {
        navigate('/spendinghistory');
    }
    const handleLogExpensesClick = () => {
        navigate('/expenses');
        }
    const handleChallengesClick = () => {
        navigate('/setchallenge');  
    };
    return (
    <div className="dashboard">
        <aside className="sidebar">
            <div className="sidebar__brand">
                <img src={piggyBankIcon} alt="NoSpendy Logo" className="logo" /> 
                <h2>NoSpendy</h2>
            </div>
            <div className="sidebar__menu">
                <ul>
                    <li className="active">Dashboard</li>
                    <li onClick={handleSpendingHistoryClick}> Spending History</li>
                    <li onClick={handleLogExpensesClick}>Log Expenses</li>
                    <li onClick= {handleChallengesClick}>Challenges</li>
                    <li>Leaderboard</li>
                    <li>Financial Overview</li>
                    <li>Notifications</li>
                    <li>Settings</li>
                    <li>Security</li>
                </ul>
            </div>
        </aside>
            {/* ========== MAIN CONTENT ========== */}
            <main className="main-content">
              {/* ========== TOP BAR ========== */}
                <header className="topbar">
                    <h1>Dashboard</h1>
                    <div className="topbar__search">
                        <input type="text" placeholder="Search" />
                        <button className="profile-btn">
                    <img
                        src="profile_icon.png"
                        alt="Profile"
                        className="profile-img"/>
                        </button>
                    </div>
                </header>
              {/* ========== CARDS (TOP STATS) ========== */}
                <section className="top-stats">
                        <div className="stat-card">
                        <img src = "calculator.png" alt = "Calc Icon" className = "calcicon"/>
                        <h3>Total Expenses</h3>
                        <p className="stat-amount">$31,140.74</p>
                        </div>
                        <div className="stat-card">
                            <img src = "cash.png" alt = "Cash Icon" className = "cashicon"/>
                            <h3>Spending Challenge</h3>
                            <p className="stat-amount">$3,000.00</p>
                        </div>
                        <div className="stat-card">
                            <img src = "coins.png" alt = "Coin Icon" className = "coinicon"/>
                            <h3>Spent This Month</h3>
                            <p className="stat-amount">$500.00</p>
                        </div>
                        <div className="stat-card">
                            <h3>Streak</h3>
                            <div className="streak-container">
                                <img src = "/streaks_icon.png" alt="Streak Icon" className="streak-icon" />
                                <span className="stat-amount">21 Days</span>
                            </div>
</                      div>
                </section>
              {/* ========== OVERVIEW & COMPARISON ========== */}
                <section className="overview">
                <div className="overview__chart">
                    <div className="chart-container">
                    <img src="/weekly_chart.png" alt="Weekly Chart" className="chart-image" />
                    </div>
                </div>
                </section>
              {/* ========== LEADERBOARD ========== */}
                <section className="leaderboard">
                <h2>Leaderboard</h2>
                <table>
                <thead>
                    <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>State</th>
                    <th>Monthly Expenses</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <img src= "gold.png" alt="Gold Medal" className="gold-icon" />
                        <td>Mai Tran</td>
                        <td>New York</td>
                        <td>$404.21</td>
                    </tr>
                    <tr>
                        <img src= "silver.png" alt="Silver Medal" className="silver-icon" />
                        <td>Matthew Ding</td>
                        <td>New Jersey</td>
                        <td>$551.21</td>
                    </tr>
                    <tr>
                        <img src= "bronze.png" alt="Bronze Medal" className="bronze-icon" />
                        <td>Yecheng Yue</td>
                        <td>New York</td>
                        <td>$674.90</td>
                    </tr>
                    </tbody>
                </table>
            </section>
            </main>
        </div>
    );
}

export default Dashboard;
