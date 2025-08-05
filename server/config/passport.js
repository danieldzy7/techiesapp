var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var secrets = require('./secrets');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(async function(id, done) {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (err) {
			done(err, null);
		}
	});

	passport.use('local-signup', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		async function(req, email, password, done) {
			try {
				const existingUser = await User.findOne({
					'local.username': email
				});
				
				if (existingUser) {
					req.flash('signupMessage', 'That email already taken');
					return done(null, false);
				}
				
				if (!req.user) {
					var newUser = new User();
					console.log('Signup Request body:', JSON.stringify(req.body));
					newUser.name = req.body.name;
					newUser.local.username = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.image = 'NO IMAGE';
					newUser.department = req.body.department;

					await newUser.save();
					console.log('Registration successful for user: ' + newUser._id);
					return done(null, newUser);
				}
				else {
					var user = req.user;
					user.local.username = email;
					user.local.password = user.generateHash(password);

					await user.save();
					return done(null, user);
				}
			} catch (err) {
				console.log('Error in Saving user: ' + err);
				return done(err);
			}
		}));

	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		async function(req, email, password, done) {
			try {
				const user = await User.findOne({
					'local.username': email
				});
				
				if (!user) {
					req.flash('loginMessage', 'No Username Found');
					return done(null, false);
				}
				if (!user.validPassword(password)) {
					req.flash('loginMessage', 'Invalid Password');
					return done(null, false);
				}
				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	));

	/**
	 * Sign in with Facebook.
	 */
	passport.use(new FacebookStrategy(secrets.facebook, async function(req, accessToken, refreshToken, profile, done) {
		try {
			if (req.user) {
				const existingUser = await User.findOne({
					facebook: profile.id
				});
				
				if (existingUser) {
					req.flash('errors', {
						msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
					});
					return done(null);
				}
				else {
					const user = await User.findById(req.user.id);
					user.facebook = profile.id;
					user.tokens.push({
						kind: 'facebook',
						accessToken: accessToken
					});
					user.name = profile.displayName;
					user.local.username = profile.id;
					user.profile.name = user.profile.name || profile.displayName;
					user.profile.gender = user.profile.gender || profile.gender;
					user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large'+ "&access_token=" + accessToken;
					await user.save();
					req.flash('info', {
						msg: 'Facebook account has been linked.'
					});
					return done(null, user);
				}
			}
			else {
				const existingUser = await User.findOne({
					facebook: profile.id
				});
				
				if (existingUser) {
					return done(null, existingUser);
				}
				else {
					var user = new User();
					user.facebook = profile.id;
					user.tokens.push({
						kind: 'facebook',
						accessToken: accessToken
					});
					user.name = profile.displayName;
					user.local.username = profile.id;
					user.profile.name = profile.displayName;
					user.profile.gender = profile.gender;
					user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
					await user.save();
					return done(null, user);
				}
			}
		} catch (err) {
			return done(err);
		}
	}));

	/**
	 * Sign in with Google.
	 */
	passport.use(new GoogleStrategy(secrets.google, async function(req, accessToken, refreshToken, profile, done) {
		try {
			if (req.user) {
				const existingUser = await User.findOne({
					google: profile.id
				});
				
				if (existingUser) {
					req.flash('errors', {
						msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
					});
					return done(null);
				}
				else {
					const user = await User.findById(req.user.id);
					user.google = profile.id;
					user.tokens.push({
						kind: 'google',
						accessToken: accessToken
					});
					user.name = profile.displayName;
					user.local.username = profile.id;
					user.profile.name = user.profile.name || profile.displayName;
					user.profile.gender = user.profile.gender || profile._json.gender;
					user.profile.picture = user.profile.picture || profile._json.image.url;
					await user.save();
					req.flash('info', {
						msg: 'Google account has been linked.'
					});
					return done(null, user);
				}
			}
			else {
				const existingUser = await User.findOne({
					google: profile.id
				});
				
				if (existingUser) {
					return done(null, existingUser);
				}
				
				const existingEmailUser = await User.findOne({
					email: profile.emails[0].value
				});
				
				if (existingEmailUser) {
					req.flash('errors', {
						msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'
					});
					return done(null);
				}
				else {
					var user = new User();
					user.email = profile.emails[0].value;
					user.google = profile.id;
					user.tokens.push({
						kind: 'google',
						accessToken: accessToken
					});
					user.name = profile.displayName;
					user.local.username = profile.id;
					user.profile.name = profile.displayName;
					user.profile.gender = profile._json.gender;
					user.profile.picture = profile._json.image.url;
					await user.save();
					return done(null, user);
				}
			}
		} catch (err) {
			return done(err);
		}
	}));

	passport.use(new BearerStrategy({},
		async function(token, done) {
			try {
				const user = await User.findOne({
					_id: token
				});
				
				if (!user) {
					return done(null, false);
				}
				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}));
};