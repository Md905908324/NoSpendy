import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signin from "./signin"
import Dashboard from "./dashboard";
import Expenses from "./expenses";
import Spendinghistory from "./spendinghistory"
import Createprofile from "./createprofile"
import Customcursor from "./customcursor"
import Setchallenge from "./setchallenge"


function App() {
  return (
    <Router>
      <Customcursor />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/createprofile" element={<Createprofile />} />
        <Route path="/spendinghistory" element={<Spendinghistory />} />
        <Route path="/setchallenge" element={<Setchallenge />} /> 
      </Routes>
    </Router>
  );
}
export default App;
