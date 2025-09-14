# Transport Management System

A comprehensive web application for managing transport plans and shipping requests between cities in India. The system supports two user roles: Admin and Agent, with city-based filtering for agents.

## Features

### Admin Features
- Create and manage transport plans
- View all shipping requests from agents
- Approve or reject shipping requests
- Track request status history
- Professional dashboard UI with responsive design

### Agent Features
- View transport plans relevant to their city
- Submit shipping requests for available plans
- Track status of submitted requests
- User-friendly interface with responsive design

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design

### Frontend
- React
- React Router
- Modern CSS with responsive design
- Form validation

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/transport-system
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Seed the database with initial users:
   ```
   node scripts/seedUsers.js
   ```

5. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Testing

1. Manual testing can be performed using the test workflow guide:
   ```
   test-workflow.md
   ```

2. API testing can be run using the test script:
   ```
   cd backend
   node scripts/test-api.js
   ```

## Default Users

### Admin User
- Username: admin
- Password: adminpassword

### Agent Users
- Username: mumbai_agent
- Password: agentpassword
- City: Mumbai

- Username: delhi_agent
- Password: agentpassword
- City: Delhi

## Project Structure

```
├── backend/
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   └── server.js         # Express server setup
│
└── frontend/
    ├── public/           # Static files
    └── src/
        ├── components/   # React components
        ├── App.js        # Main application component
        └── index.js      # Entry point
```

## Features Implemented

- [x] User model with support for 15 Indian cities
- [x] Enhanced Plan model with additional fields
- [x] Professional UI design for Admin Dashboard
- [x] Professional UI design for Agent Dashboard
- [x] Status management for shipping requests
- [x] City-based filtering for agents
- [x] Form validation and error handling
- [x] Responsive design for mobile compatibility
- [x] Testing workflow documentation

## License

MIT