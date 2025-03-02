import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/signin.css";

const Signin = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
    email: "",
    password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        console.log("Sign in form submitted for email:", formData.email);
        
        try {
            console.log("Calling login function from AuthContext");
            const userData = await login(formData.email, formData.password);
            console.log("Login successful, user data received:", { ...userData, token: "HIDDEN" });
            console.log("Navigating to dashboard");
            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed in signin component:", error);
            setError(error.response?.data?.error || "Invalid username or password");
        }
    };

    return (
        <div className="signin-container">
        <div className="signin-header">
            <img src={`${process.env.PUBLIC_URL}/assets/piggyBankIcon.png`} alt="NoSpendy Logo" className="logo" />
            <h1>NoSpendy</h1>
        </div>

        <div className="signin-box">
            <h2>Sign In</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
                type="email"
                name="email"
                value={formData.email}
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
