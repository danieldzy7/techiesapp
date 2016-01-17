var func = require('../routes/api_functions');


module.exports = function(router, passport) {

	router.use(passport.authenticate('bearer', {
		session: false
	}));
	
	//--------------Current User-file related api-----------------//
	router.get('/getRatings', function(req, res) {
		func.getRatings(req.user.local.username, function(result) {
			res.json(result);
		});
	});

	
	router.get('/getUserIdeas', function(req, res) {
		func.getUserIdeas(req.user.local.username, function(result) {
			res.json(result);
		});
	});

	router.post('/createIdea', function(req, res) {
		func.createIdea(req.body.title, req.body.description, req.body.category, req.body.tags, req.body.username, function(result) {
			res.json(result);
		});
	});

	router.put('/idea', function(req, res) {
		func.updateIdea(req.query.id, req.body.title, req.body.description, req.body.category, req.body.tags, req.body.likes, req.body.dislikes, function(result) {
			res.json(result);
		});
	});
	
	router.delete('/idea', function(req, res) {
		func.deleteIdea(req.param('id'), function(result) {
			res.json(result);
		});
	});

	// ----------------Others user-file related---------------------------//
	
	router.get('/getOtherIdeas', function(req, res){
		func.getOtherIdeas(req.user.local.username, function(result){
			res.json(result);
		});
	});

	router.post('/setFilter', function(req, res) {
		func.setFilter(req.user.local.username, req.body.clear, req.body.tags, function(response) {
			res.json(response);
		});
	});

	router.put('/updateCategory', function(req, res) {
		func.updateCategory(req.user.local.username, req.body.category, req.body.flag, function(response) {
			res.json(response);
		});
	});

	router.post('/retrieve', function(req, res) {
		func.retrieve(req.body.posInt, req.body.sdate, req.body.edate, function(response) {
			res.json(response);
			});
	});
	
	router.get('/categoryCount', function(req, res){
		func.categoryCount(function(result){
			res.json(result);
		});
	});

//------------------------------- Likes Dislikes---------------------------------//

	router.get('/findRating', function(req, res) {
		func.findRating(req.user.local.username, req.query.id, function(result) {
			res.json(result);
		});
	});
	
	router.put('/userlike', function(req, res) {
		if (req.body.flag == -1) {
			func.pullUserRating(req.user.local.username, req.body.compare, req.body.id, function(result) {
				res.json(result);
			});
		} else if (req.body.flag == 1){
			func.pushUserRating(req.user.local.username, req.body.compare, req.body.id, function(result) {
				res.json(result);
			});	
		} else if (req.body.flag == 0) {
			func.pushUserRating(req.user.local.username, req.body.compare, req.body.id, function(result) {
				func.pullUserRating(req.user.local.username, (1 - req.body.compare), req.body.id, function(result) {
					res.json(result);
				});
			});			
		}
	});
	













};
