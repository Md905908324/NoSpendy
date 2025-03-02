import React, { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        } catch (error) {
          console.error("User data parsing failed:", error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      console.log("Registration attempt for user:", userData.username);
      
      // Use the API endpoint without /api prefix
      const response = await API.post('/users/register', userData);
      
      console.log("Registration response received:", response.status);
      
      if (response.data && response.data.token) {
        const user = {
          username: userData.username,
          token: response.data.token,
          userId: response.data.userId || response.data._id
        };
        
        console.log("Setting user data in localStorage after registration:", { ...user, token: "HIDDEN" });
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setAuthError(null);
        return user;
      } else {
        console.error("Registration response missing token:", response.data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Registration error details:", error.response ? error.response.data : error.message);
      setAuthError(error.response ? error.response.data.message : error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Login attempt for email/username:", email);
      
      // Send both username and email to support both login methods
      const response = await API.post('/users/login', { 
        username: email, // Use the input as both username and email
        email: email,
        password 
      });
      
      console.log("Login response received:", response.status);
      
      if (response.data && response.data.token) {
        const userData = {
          username: response.data.username || email,
          token: response.data.token,
          userId: response.data.userId || response.data._id
        };
        
        console.log("Setting user data in localStorage:", { ...userData, token: "HIDDEN" });
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        setAuthError(null);
        return userData;
      } else {
        console.error("Login response missing token:", response.data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error details:", error.response ? error.response.data : error.message);
      setAuthError(error.response ? error.response.data.error : error.message);
      throw error;
    }
  };

  // Logout function - improved with proper cleanup
  const logout = async () => {
    try {
      console.log("Logout initiated");
      
      // Only attempt to call logout API if user is logged in
      if (currentUser && currentUser.token) {
        try {
          // Optional: notify backend about logout
          await API.post('/users/logout');
          console.log("Backend logout successful");
        } catch (error) {
          // Continue with client-side logout even if backend fails
          console.log("Backend logout failed, continuing with client-side logout");
        }
      }
      
      // Clear user data regardless of backend response
      console.log("Clearing user data from state and localStorage");
      setCurrentUser(null);
      localStorage.removeItem('user');
      setAuthError(null);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear data on error
      setCurrentUser(null);
      localStorage.removeItem('user');
      return false;
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    loading,
    authError,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 