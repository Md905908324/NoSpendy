import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signin.css";
import piggyBankIcon from "./piggyBankIcon.png"; 

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    username: "",
    password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sign In Attempt:", formData);
        alert("Logged in successfully!");
        navigate("/dashboard"); 
    };

    return (
        <div className="signin-container">
        <div className="signin-header">
            <img src={piggyBankIcon} alt="NoSpendy Logo" className="logo" />
            <h1>NoSpendy</h1>
        </div>

        <div className="signin-box">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
            <label>Username:</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
            />

            <label>Password:</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />

            <button type="submit">Sign In</button>
            </form>

            <div className="signin-links">
            <a href="/forgot-password">Forgot Password</a>
            <a href="/createprofile">Create New Account</a>
            </div>
        </div>
        </div>
    );
};

export default Signin;
