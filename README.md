# Techies App 🚀

A collaborative idea sharing platform built with Node.js, Express, MongoDB, and AngularJS. Share, discover, and collaborate on innovative ideas with other tech enthusiasts.

## ✨ Features

- **Idea Management**: Create, edit, and delete ideas with categories and tags
- **User Authentication**: Secure login with Local, Google OAuth, and Facebook strategies
- **Real-time Chat**: Live chat room for idea discussions
- **Rating System**: Like/dislike ideas to show appreciation
- **Interactive Charts**: Visualize idea distribution across categories
- **Sample Data Generation**: Create test data for development

## 🛠️ Main Technologies

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Socket.IO** - Real-time communication

### Frontend
- **AngularJS** - JavaScript framework
- **Bootstrap** - CSS framework
- **AmCharts** - Data visualization

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/danieldzy7/techiesapp.git
cd techiesapp
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install frontend dependencies (Bower)
bower install
```

### 3. Configure Database
Edit `server/config/database.js` with your MongoDB connection string:
```javascript
module.exports = {
    url: 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/techies?retryWrites=true&w=majority'
};
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)


