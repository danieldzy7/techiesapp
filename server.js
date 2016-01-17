// Setup Express
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT;
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var session = require('express-session'); 
var morgan = require('morgan');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); // Enable req.body
var passport = require('passport');
var methodOverride = require('method-override'); // Enable expressjs to handle DELETE method
var flash = require('connect-flash'); // Flash message to ejs file
var MongoStore = require('connect-mongo')(session);
var path = require('path');

var configDB = require('./server/config/database.js');
mongoose.connect(configDB.url);
require('./server/config/passport')(passport); // Get user's passport config setting. 

app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json()); 

app.use(session({
	secret: 'ilovewebprogramming',
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 2 * 24 * 60 * 60
	})
}));

app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions
app.use(flash()); // Use connect-flash for flash messages stored in session

// Set view engine to EJS, and set the directory our views will be stored in
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'client', 'views'));

// Serve static files from client folder.
// ex: libs/bootstrap/bootstrap.css in our html actually points to client/libs/bootstrap/bootstrap.css
app.use(express.static(path.resolve(__dirname, 'client')));

app.use(function(req, res, next) {
	next();
});

// Socket.io ChatRoom setup
var chatUsers = [];
io.on('connection', function(socket) {

	var displayName = '';
	console.log('A user has connected............')

	socket.on('request-users', function() {
		socket.emit('chatUsers', {
			chatUsers: chatUsers
		});
	});

	socket.on('message', function(data) {
		io.emit('message', {
			displayName: displayName,
			message: data.message
		});
	})
	
	socket.on('add-user', function(data) {
		if (chatUsers.indexOf(data.displayName) == -1) {
			io.emit('add-user', {
				displayName: data.displayName
			});
			displayName = data.displayName;
			chatUsers.push(data.displayName);
		}
		else {
			socket.emit('prompt-username', {
				message: 'User Already Exists'
			})
		}
	})

	socket.on('disconnect', function() {
		console.log(displayName + ' has disconnected..............');
		chatUsers.splice(chatUsers.indexOf(displayName), 1);
		io.emit('remove-user', {
			displayName: displayName
		});
	})
});

// Api Router Oauth token
var api = express.Router();
require('./server/routes/api.js')(api, passport);
app.use('/api', api);

// Passport auth
var auth = express.Router();
require('./server/routes/auth.js')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./server/routes/secure.js')(secure, passport);
app.use('/', secure);

http.listen(port);
console.log('Server running on port: ' + port);
