import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Signin from "./signin"
import Dashboard from "./dashboard";
import Expenses from "./expenses";
import SpendingHistory from './spendinghistory';
import Createprofile from "./createprofile";
import Leaderboard from './leaderboard';

function App() {
  return (
    <AuthProvider>
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
