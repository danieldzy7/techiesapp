# Techies App 🚀

A collaborative idea sharing platform built with modern web technologies. Share, discover, and collaborate on innovative ideas with other tech enthusiasts.

## ✨ Features

### 🎯 Core Functionality
- **Idea Management**: Create, edit, and delete ideas with rich metadata
- **User Authentication**: Secure login with Local, Google OAuth, and Facebook strategies
- **Real-time Chat**: Live chat room for idea discussions
- **Rating System**: Like/dislike ideas to show appreciation
- **Category Filtering**: Organize ideas by categories (Health, Technology, Education, Finance, Travel)
- **Tag System**: Add keywords to ideas for better discoverability
- **Pagination**: Efficient browsing of large idea collections

### 📊 Analytics & Visualization
- **Interactive Charts**: Visualize idea distribution across categories
- **Data Analytics**: Track user engagement and idea popularity
- **Real-time Updates**: Live data updates across all users

### 🔧 Developer Features
- **Sample Data Generation**: Create test data for development
- **User Management**: Comprehensive user administration tools
- **API Endpoints**: RESTful API for all operations
- **Socket.IO Integration**: Real-time bidirectional communication

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Socket.IO** - Real-time communication
- **Helmet.js** - Security middleware

### Frontend
- **AngularJS** - JavaScript framework
- **Bootstrap** - CSS framework
- **AmCharts** - Data visualization
- **Font Awesome** - Icon library
- **Toastr** - Notification library

### Authentication
- **Local Strategy** - Email/password authentication
- **Google OAuth 2.0** - Google account integration
- **Facebook OAuth** - Facebook account integration

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/techies-app.git
cd techies-app
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install frontend dependencies (Bower)
bower install
```

### 3. Configure Environment
Create a `.env` file in the root directory (optional):
```env
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 4. Update Database Configuration
Edit `server/config/database.js` with your MongoDB connection string:
```javascript
module.exports = {
    url: 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/techies?retryWrites=true&w=majority'
};
```

### 5. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
techiesapp/
├── client/                 # Frontend assets
│   ├── css/               # Stylesheets
│   ├── img/               # Images and icons
│   ├── js/                # JavaScript files
│   │   ├── libs/          # Third-party libraries
│   │   └── main-controller.js  # Main Angular controller
│   ├── partials/          # Modal templates
│   └── views/             # EJS templates
├── server/                # Backend code
│   ├── config/            # Configuration files
│   │   ├── database.js    # Database configuration
│   │   ├── googleauth.js  # Google OAuth config
│   │   ├── passport.js    # Passport authentication
│   │   └── secrets.js     # Secret keys
│   ├── models/            # Mongoose models
│   │   ├── idea.js        # Idea schema
│   │   └── user.js        # User schema
│   └── routes/            # Express routes
│       ├── api.js         # API endpoints
│       ├── api_functions.js # Business logic
│       ├── auth.js        # Authentication routes
│       └── secure.js      # Protected routes
├── package.json           # Node.js dependencies
├── bower.json            # Frontend dependencies
├── server.js             # Main application entry point
└── README.md             # Project documentation
```

## 🔧 Configuration

### Authentication Setup

#### Google OAuth 2.0
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`
6. Update `server/config/googleauth.js` with your credentials

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:3000/auth/facebook/callback`
5. Update `server/config/passport.js` with your app credentials

### Database Configuration
The application uses MongoDB with Mongoose ODM. Update the connection string in `server/config/database.js`:

```javascript
module.exports = {
    url: 'mongodb+srv://username:password@cluster.mongodb.net/techies?retryWrites=true&w=majority'
};
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/google` - Google OAuth login
- `GET /auth/facebook` - Facebook OAuth login

### Idea Management Endpoints
- `GET /api/getUserIdeas` - Get user's ideas
- `GET /api/getOtherIdeas` - Get ideas from other users
- `POST /api/createIdea` - Create new idea
- `PUT /api/idea` - Update existing idea
- `DELETE /api/idea` - Delete idea

### Rating System Endpoints
- `GET /api/findRating` - Get user's rating for an idea
- `PUT /api/userlike` - Update user's rating
- `GET /api/getRatings` - Get all user ratings

### Analytics Endpoints
- `GET /api/categoryCount` - Get category statistics

### Sample Data Endpoints
- `POST /api/createSampleData` - Generate sample ideas
- `POST /api/createSampleUsers` - Create sample users
- `POST /api/clearAllUserIdeas` - Clear user's ideas
- `POST /api/removeAllData` - Clear all data

## 🎨 Customization

### Styling
The application uses Bootstrap for styling. Customize the appearance by modifying:
- `client/css/style.css` - Custom styles
- `client/css/creative.css` - Creative theme styles
- `client/css/sb-admin-2.css` - Admin panel styles

### Themes
The application includes multiple themes:
- Default Bootstrap theme
- Creative theme
- Admin panel theme

### Categories
Default categories include:
- Health
- Technology
- Education
- Finance
- Travel

Add new categories by updating the frontend templates and backend validation.

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Content Security Policy** - XSS protection
- **Session Management** - Secure session handling
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request handling

## 🧪 Testing

### Sample Data Generation
The application includes tools for generating test data:

1. **Create Sample Ideas**: Generates 50 random ideas for the current user
2. **Create Sample Users**: Creates 3 users with specialized ideas
3. **Clear Data**: Remove all data for testing

### Manual Testing
Test the following features:
- User registration and login
- Idea creation, editing, and deletion
- Rating system (likes/dislikes)
- Category filtering
- Real-time chat
- Data visualization

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables
5. Deploy the application

```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set SESSION_SECRET=your-session-secret
git push heroku main
```

### Other Platforms
The application can be deployed to:
- **AWS** - Using Elastic Beanstalk or EC2
- **Google Cloud** - Using App Engine or Compute Engine
- **Azure** - Using App Service
- **DigitalOcean** - Using App Platform or Droplets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **MongoDB** - Database
- **AngularJS** - Frontend framework
- **Bootstrap** - CSS framework
- **Socket.IO** - Real-time communication
- **Passport.js** - Authentication


