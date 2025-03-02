import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./expenses.css";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState({
    food: "",
    transportation: "",
    entertainment: "",
    essentials: "",
  });

  const handleChange = (e) => {
    setExpenses({ ...expenses, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Expense Data:", expenses);
    alert("Expense added successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="log-expenses">
      <header>
        <h1>Log Expenses</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <img src = "burger.png" alt = "Burger Icon" className = "burgericon" />
        <label>Food: $</label>
        <input type="text" name="food" value={expenses.food} onChange={handleChange} />
        
        <img src = "scooter.png" alt = "Scooter Icon" className = "scootericon" />
        <label>Transportation: $</label>
        <input type="text" name="transportation" value={expenses.transportation} onChange={handleChange} />
        
        <img src = "laptop.png" alt = "Laptop Icon" className = "laptopicon" />
        <label>Entertainment: $</label>
        <input type="text" name="entertainment" value={expenses.entertainment} onChange={handleChange} />

        <img src = "checklist.png" alt = "Checklist Icon" className = "checklisticon" />
        <label>Essentials: $</label>
        <input type="text" name="essentials" value={expenses.essentials} onChange={handleChange} />

        <button type="submit">Add Expense</button>

      </form>
    </div>
  );
};

export default Expenses;
