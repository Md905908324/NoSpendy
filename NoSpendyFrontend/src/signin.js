import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./signin.css";
import piggyBankIcon from "./piggyBankIcon.png"; // Add the piggy bank icon image file

const Signin = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
    username: "",
    password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            await login(formData.username, formData.password);
            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            setError("Invalid username or password");
        }
    };

    return (
        <div className="signin-container">
        <div className="signin-header">
            <img src={piggyBankIcon} alt="NoSpendy Logo" className="logo" />
            <h1>NoSpendy</h1>
        </div>

        <div className="signin-box">
            <h2>Sign In</h2>
            {error && <p className="error-message">{error}</p>}
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
