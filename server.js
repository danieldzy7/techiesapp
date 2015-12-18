var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var path = require('path');

var configDB = require('./server/config/database.js');
mongoose.connect(configDB.url);
require('./server/config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({secret: 'anystringoftext',
				 saveUninitialized: true,
				 resave: true,
				 store: new MongoStore({ mongooseConnection: mongoose.connection,
				 							ttl: 2 * 24 * 60 * 60 })}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//Set our view engine to EJS, and set the directory our views will be stored in
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'client', 'views'));

//serve static files from client folder.
//ex: libs/bootstrap/bootstrap.css in our html actually points to client/libs/bootstrap/bootstrap.css
app.use(express.static(path.resolve(__dirname, 'client')));


app.use(function(req, res, next){
	console.log("" + req.user);
	console.log("##############################");
	next();
});


var api = express.Router();
require('./server/routes/api.js')(api, passport);
app.use('/api', api);

var auth = express.Router();
require('./server/routes/auth.js')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./server/routes/secure.js')(secure, passport);
app.use('/', secure);


app.listen(port);
console.log('Server running on port: ' + port);




