import './styles/App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import Signin from "./pages/signin.js";
import Dashboard from "./pages/dashboard.js";
import Expenses from "./pages/expenses.js";
import SpendingHistory from './pages/spendinghistory.js';
import Createprofile from "./pages/createprofile.js";
import Leaderboard from './pages/leaderboard.js';
import Settings from './pages/settings.js';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Default Route ("/") Redirects to SignIn */}
            <Route path="/" element={<Navigate to="/signin" />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/createprofile" element={<Createprofile />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="/spendinghistory" element={
              <ProtectedRoute>
                <SpendingHistory />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
