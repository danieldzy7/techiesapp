/**
 * Techies App - Main Server File
 * A Node.js application for idea sharing and collaboration
 * 
 * @author Daniel D
 * @version 1.0.0
 */

// ============================================================================
// DEPENDENCIES & IMPORTS
// ============================================================================
const express = require('express');
const http = require('http');
const io = require('socket.io');
const path = require('path');

// Middleware
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

// Database
const mongoose = require('mongoose');
const configDB = require('./server/config/database.js');

// ============================================================================
// APP INITIALIZATION
// ============================================================================
const app = express();
const server = http.Server(app);
const socketIO = io(server);
const PORT = process.env.PORT || 3000;

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
mongoose.connect(configDB.url)
	.then(() => console.log('✅ MongoDB connected successfully'))
	.catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Security middleware
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: [
				"'self'", 
				"'unsafe-inline'", 
				"'nonce-user-data'", 
				"https://cdn.socket.io", 
				"https://maxcdn.bootstrapcdn.com"
			],
			styleSrc: [
				"'self'", 
				"'unsafe-inline'", 
				"https://maxcdn.bootstrapcdn.com"
			],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'", "ws:", "wss:"]
		}
	}
}));

// Logging and parsing middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
	secret: 'ilovewebprogramming',
	saveUninitialized: false,
	resave: false,
	store: MongoStore.create({
		mongoUrl: configDB.url,
		ttl: 2 * 24 * 60 * 60 // 2 days
	})
}));

// Authentication middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ============================================================================
// VIEW ENGINE & STATIC FILES
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'client', 'views'));
app.use(express.static(path.resolve(__dirname, 'client')));

// ============================================================================
// ROUTES
// ============================================================================

// Root route - redirect to auth landing page
app.get('/', (req, res) => {
	res.redirect('/auth');
});

// API routes (OAuth token based)
const apiRouter = express.Router();
require('./server/routes/api.js')(apiRouter, passport);
app.use('/api', apiRouter);

// Authentication routes
const authRouter = express.Router();
require('./server/routes/auth.js')(authRouter, passport);
app.use('/auth', authRouter);

// Secure routes (must come after auth routes)
const secureRouter = express.Router();
require('./server/routes/secure.js')(secureRouter, passport);
app.use('/', secureRouter);

// ============================================================================
// SOCKET.IO CHAT ROOM SETUP
// ============================================================================
const chatUsers = [];

socketIO.on('connection', (socket) => {
	let displayName = '';
	console.log('👤 User connected to chat room');

	// Send current users list
	socket.on('request-users', () => {
		socket.emit('chatUsers', { chatUsers });
	});

	// Handle chat messages
	socket.on('message', (data) => {
		socketIO.emit('message', {
			displayName,
			message: data.message
		});
	});

	// Add user to chat room
	socket.on('add-user', (data) => {
		if (chatUsers.indexOf(data.displayName) === -1) {
			socketIO.emit('add-user', {
				displayName: data.displayName
			});
			displayName = data.displayName;
			chatUsers.push(data.displayName);
		} else {
			socket.emit('prompt-username', {
				message: 'User Already Exists'
			});
		}
	});

	// Handle user disconnection
	socket.on('disconnect', () => {
		console.log(`👤 ${displayName} disconnected from chat room`);
		const userIndex = chatUsers.indexOf(displayName);
		if (userIndex > -1) {
			chatUsers.splice(userIndex, 1);
		}
		socketIO.emit('remove-user', { displayName });
	});
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
server.listen(PORT, () => {
	console.log(`🚀 Server running on port: ${PORT}`);
	console.log(`📱 Application available at: http://localhost:${PORT}`);
});
