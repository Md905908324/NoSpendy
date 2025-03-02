import React, { useState } from "react";
import "./setchallenge.css"; 
import { useNavigate } from "react-router-dom";

const Setchallenge = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("1 week");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Challenge Set:", { amount, duration });
        alert(`Challenge Set!\nAmount: $${amount}\nDuration: ${duration}`);
        navigate("/dashboard"); 
    };

    return (
        <div className="challenge-container">
            <div className="challenge-box">
                <h2><i>SET CHALLENGE:</i></h2>

                <form onSubmit={handleSubmit}>
                    <label>Amount:</label>
                    <div className="amount-box">
                        <span className="currency">$</span>
                        <input 
                            type="text" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <label>Duration:</label>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                        <option value="1 week">1 Week</option>
                        <option value="1 month">1 Month</option>
                        <option value="3 months">3 Months</option>
                        <option value="6 months">6 Months</option>
                        <option value="1 year">1 Year</option>
                    </select>

                    <button type="submit">Set Challenge</button>
                </form>
            </div>
        </div>
    );
};

export default Setchallenge;
