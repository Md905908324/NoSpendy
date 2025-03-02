# NoSpendy

## Project Overview
NoSpendy is a personal finance application designed to help users track their expenses, set budgets, and compete with friends to save money. The application features user registration, expense tracking, and a leaderboard to encourage healthy financial habits through friendly competition.

## Repository Structure
This repository contains both the frontend and backend code for the NoSpendy application:

- **Root Directory**: Contains the React frontend application
- **NoSpendyBackend/**: Contains the Node.js/Express backend API

## Technologies Used
### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Axios for API requests
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB for database
- Mongoose for object modeling
- JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd NoSpendyBackend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=50001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```
   npm start
   ```
   The server will run on http://localhost:50001

### Frontend Setup
1. From the root directory, install dependencies:
   ```
   npm install
   ```

2. Start the frontend development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Features
- User registration and authentication
- Expense tracking and categorization
- Budget setting and monitoring
- Leaderboard to compare savings with friends
- Profile customization

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
