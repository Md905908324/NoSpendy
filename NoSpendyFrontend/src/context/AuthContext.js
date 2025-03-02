import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
          // Verify the token is still valid with the backend
          const response = await axios.get('/users/verify-token', {
            headers: { Authorization: `Bearer ${userData.token}` }
          });
          
          if (response.data.valid) {
            setCurrentUser(userData);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error("Token verification failed:", error);
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
      const response = await axios.post('/users/register', userData);
      const user = response.data;
      
      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthError(null);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post('/users/login', { username, password });
      const user = response.data;
      
      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthError(null);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.error || 'Invalid username or password');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setAuthError(null);
  };

  // Add this function to the AuthContext
  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    loading,
    authError,
    setAuthError,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 