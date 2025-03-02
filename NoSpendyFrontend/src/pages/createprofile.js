import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/createprofile.css";

const Createprofile = () => {
  const navigate = useNavigate();
  const { register, authError, setAuthError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    monthlyIncome: "",
    savingsGoal: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Validate monthly income
    if (formData.monthlyIncome && isNaN(parseFloat(formData.monthlyIncome))) {
      newErrors.monthlyIncome = "Monthly income must be a number";
    }
    
    // Validate savings goal
    if (formData.savingsGoal && isNaN(parseFloat(formData.savingsGoal))) {
      newErrors.savingsGoal = "Savings goal must be a number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    if (validateForm()) {
      try {
        console.log("Submitting registration data:", {
          ...formData,
          password: "[HIDDEN]",
          confirmPassword: "[HIDDEN]"
        });
        
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...userData } = formData;
        
        // Convert numeric strings to numbers
        if (userData.monthlyIncome) {
          userData.monthlyIncome = parseFloat(userData.monthlyIncome);
        }
        if (userData.savingsGoal) {
          userData.savingsGoal = parseFloat(userData.savingsGoal);
        }
        
        // Use the register function from AuthContext which uses the API utility
        await register(userData);
        navigate("/dashboard");
      } catch (error) {
        console.error("Registration failed:", error);
        
        // Display more specific error messages
        if (error.response) {
          setAuthError(error.response.data.message || error.response.data.error || "Registration failed. Please try again.");
        } else if (error.request) {
          setAuthError("Network error. Please check your connection and try again.");
        } else {
          setAuthError(error.message || "Registration failed. Please try again.");
        }
      }
    }
  };

  return (
    <div className="createprofile-container">
      <div className="createprofile-header">
        <img src={`${process.env.PUBLIC_URL}/assets/piggyBankIcon.png`} alt="NoSpendy Logo" className="logo" />
        <h1>NoSpendy</h1>
      </div>

      <div className="createprofile-box">
        <h2>Create Account</h2>
        {authError && <p className="error-message">{authError}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label>Location (State):</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Monthly Income ($):</label>
            <input
              type="text"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
            />
            {errors.monthlyIncome && <p className="field-error">{errors.monthlyIncome}</p>}
          </div>

          <div className="form-group">
            <label>Monthly Savings Goal ($):</label>
            <input
              type="text"
              name="savingsGoal"
              value={formData.savingsGoal}
              onChange={handleChange}
            />
            {errors.savingsGoal && <p className="field-error">{errors.savingsGoal}</p>}
          </div>

          <button type="submit">Create Account</button>
        </form>

        <div className="createprofile-links">
          <p>Already have an account? <a href="/signin">Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default Createprofile;