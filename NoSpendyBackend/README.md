# NoSpendyBackend

## Overview
This is the backend API for the NoSpendy application, providing endpoints for user authentication, expense tracking, and leaderboard functionality.

## Technology Stack
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- CORS for cross-origin resource sharing

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and receive JWT token

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get leaderboard data

### Expenses
- `GET /api/expenses` - Get all expenses for current user
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Categories
- `GET /api/categories` - Get all expense categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

## Data Models

### User
- username: String (required, unique)
- email: String (required, unique)
- password: String (required, hashed)
- firstName: String
- lastName: String
- dailyBudget: Number
- weeklyBudget: Number
- monthlyBudget: Number
- createdAt: Date

### Expense
- user: ObjectId (reference to User)
- amount: Number (required)
- category: String
- description: String
- date: Date
- createdAt: Date

### Category
- name: String (required)
- icon: String
- color: String
- user: ObjectId (reference to User)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=50001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

4. The API will be available at http://localhost:50001

## Error Handling
The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```
