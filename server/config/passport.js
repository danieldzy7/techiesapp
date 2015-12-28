var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var secrets = require('./secrets');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done) {
			process.nextTick(function() {
				User.findOne({
					'local.username': email
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email already taken'));
					}
					if (!req.user) {
						var newUser = new User();
						console.log('Signup Request body: ' + req.body);
						newUser.name = req.body.name;
						newUser.local.username = email;
						newUser.local.password = newUser.generateHash(password);
						newUser.image = 'NO IMAGE';
						newUser.department = req.body.department;

						newUser.save(function(err) {
							if (err) {
								console.log('Error in Saving user: ' + err);
								throw err;
							}
							console.log(newUser.UserId + ' Registration succesful');
							return done(null, newUser);
						})
					}
					else {
						var user = req.user;
						user.local.username = email;
						user.local.password = user.generateHash(password);

						user.save(function(err) {
							if (err) {
								throw err;
							}
							return done(null, user);
						})
					}
				})

			});
		}));

	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done) {
			process.nextTick(function() {
				User.findOne({
					'local.username': email
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false, req.flash('loginMessage', 'No Username Found'));
					}
					if (!user.validPassword(password)) {
						return done(null, false, req.flash('loginMessage', 'Invalid Password'));
					}
					return done(null, user);

				});
			});
		}
	));

	/**
	 * Sign in with Facebook.
	 */
	passport.use(new FacebookStrategy(secrets.facebook, function(req, accessToken, refreshToken, profile, done) {
		if (req.user) {
			User.findOne({
				facebook: profile.id
			}, function(err, existingUser) {
				if (existingUser) {
					req.flash('errors', {
						msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
					});
					done(err);
				}
				else {
					User.findById(req.user.id, function(err, user) {
						user.facebook = profile.id;
						user.tokens.push({
							kind: 'facebook',
							accessToken: accessToken
						});
						user.name = profile.displayName;
						user.local.username = profile.id;
						user.profile.name = user.profile.name || profile.displayName;
						user.profile.gender = user.profile.gender || profile._json.gender;
						user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
						user.save(function(err) {
							req.flash('info', {
								msg: 'Facebook account has been linked.'
							});
							done(err, user);
						});
					});
				}
			});
		}
		else {
			User.findOne({
				facebook: profile.id
			}, function(err, existingUser) {
				if (existingUser) return done(null, existingUser);
				User.findOne({
					email: profile._json.email
				}, function(err, existingEmailUser) {
					if (existingEmailUser) {
						req.flash('errors', {
							msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'
						});
						done(err);
					}
					else {
						var user = new User();
						user.email = profile._json.email;
						user.facebook = profile.id;
						user.tokens.push({
							kind: 'facebook',
							accessToken: accessToken
						});
						
						user.name = profile.displayName;
						user.local.username = profile.id;
						user.profile.name = profile.displayName;
						user.profile.gender = profile._json.gender;
						user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
						user.profile.location = (profile._json.location) ? profile._json.location.name : '';
						user.save(function(err) {
							done(err, user);
						});
					}
				});
			});
		}
	}));

	/**
	 * Sign in with Google.
	 */
	passport.use(new GoogleStrategy(secrets.google, function(req, accessToken, refreshToken, profile, done) {
		if (req.user) {
			User.findOne({
				google: profile.id
			}, function(err, existingUser) {
				if (existingUser) {
					req.flash('errors', {
						msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
					});
					done(err);
				}
				else {
					User.findById(req.user.id, function(err, user) {
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
						user.save(function(err) {
							req.flash('info', {
								msg: 'Google account has been linked.'
							});
							done(err, user);
						});
					});
				}
			});
		}
		else {
			User.findOne({
				google: profile.id
			}, function(err, existingUser) {
				if (existingUser) return done(null, existingUser);
				User.findOne({
					email: profile.emails[0].value
				}, function(err, existingEmailUser) {
					if (existingEmailUser) {
						req.flash('errors', {
							msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'
						});
						done(err);
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
						user.save(function(err) {
							done(err, user);
						});
					}
				});
			});
		}
	}));


	passport.use(new BearerStrategy({},
		function(token, done) {
			User.findOne({
				_id: token
			}, function(err, user) {
				if (!user) {
					return done(null, false);
				}
				return done(null, user);
			});
		}));


};