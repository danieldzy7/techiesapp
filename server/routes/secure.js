module.exports = function(router, passport){

	router.use(function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		res.redirect('/auth');
	});

	router.get('/profile', function(req, res){
		// Create a clean user object for the frontend
		const userForFrontend = {
			_id: req.user._id,
			name: req.user.name,
			local: req.user.local,
			department: req.user.department,
			rating: req.user.rating,
			categoryPreference: req.user.categoryPreference,
			sortingPreference: req.user.sortingPreference,
			filter: req.user.filter,
			facebook: req.user.facebook,
			google: req.user.google,
			tokens: req.user.tokens,
			email: req.user.email,
			profile: req.user.profile
		};
		
		res.render('profile.ejs', { user: userForFrontend });
	});

};