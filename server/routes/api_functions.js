var User = require('../models/user');
var Idea = require('../models/idea');


function createIdea(title, description, category, tags, email, callback) {
	User.findOne({
		'local.username': email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			new Idea({
				author: {
					'id': result._id,
					'name': result.name,
					'email': result.local.username
				},
				title: title,
				normalized: title.toLowerCase(),
				description: description,
				tags: tags,
				category: category
			}).save(function(err, result) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					callback(result);
				}
			});
		}
	});
}

function getUserIdeas(email, callback) {
	User.findOne({
		'local.username': email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			Idea.find({
				'author.id': result._id
			}, function(err, result) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					callback(result);
				}
			});
		}
	});
}

function updateIdea(id, title, description, category, tags, likes, dislikes, callback){
	Idea.findOneAndUpdate({
		'_id':id
	},
	{
		$set: {
			'title': title,
			'description': description,
			'category': category,
			'tags': tags
		},
		$inc: {
			'rating.likes': likes,
			'rating.dislikes': dislikes
		}
	},{
		new: true
	},function(err, result){
		if(err){
			console.log(err);
			throw err;
		}else{
			callback(result);
		}
	});
}

function deleteIdea(id, callback) {
	Idea.remove({
		'_id': id
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result);
		}
	});
}


function getOtherIdeas(email, callback) {
	User.findOne({
		'local.username': email
	}, function(err, result) {
		if (err) {
			console.log('Cannot get other user idea' + err);
			throw err;
		} else {
			if (result.filter.length > 0) {
				if (result.sortingPreference.sortBy == 'date') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference},
						'tags': {$in: result.filter}
					}, null, {
						sort: {
							'date': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							console.log(result);
							callback(result);
						}
					});
				} else if (result.sortingPreference.sortBy == 'normalized') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference},
						'tags': {$in: result.filter}
					}, null, {
						sort: {
							'normalized': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							callback(result);
						}
					});
				}
			} else {
				if (result.sortingPreference.sortBy == 'date') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference}
					}, null, {
						sort: {
							'date': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							callback(result);
						}
					});
				} else if (result.sortingPreference.sortBy == 'normalized') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference}
					}, null, {
						sort: {
							'normalized': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							callback(result);
						}
					});
				}
			}
		}
	});
}


//----------------------------------     Filters     -----------------------------------------//

function setFilter(email, clear, tags, callback) {
	if (clear == 1) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$set: {
				'filter': []
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});
	} else {
		var correctTags = (tags.replace(/;+/g, ";")).replace(/'/g, "\\'");

		if (correctTags.charAt(correctTags.length - 1) == ';') {
			correctTags = correctTags.substring(0, correctTags.length - 1)
		}

		if (correctTags.charAt(0) == ';') {
			correctTags = correctTags.substring(1, correctTags.length)
		}

		correctTags = correctTags.split(';');
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$set: {
				'filter': correctTags
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});
	}
}

function retrieve(posInt, sdate, edate, callback) {
	sdate = new Date(sdate);
	edate = new Date(edate);
	sdate.setHours(0);
	sdate.setMinutes(0);
	sdate.setSeconds(0);
	edate.setHours(23);
	edate.setMinutes(59);
	edate.setSeconds(59);
	Idea.find({
		'date': {
			$gte: sdate,
			$lt: edate
		}
	}, null, {
		sort: {
			'rating.likes': -1
		}
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			if (posInt > result.length) {
				posInt = result.length;
			}
			callback(result.slice(0, posInt));
		}
	});
}


function updateCategory(email, category, flag, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$push: {
				'categoryPreference': category
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	} else if (flag == 0) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$pull: {
				'categoryPreference': category
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});
	}
}

//-------------------------------- likes Disliks-------------------------------------//



function findRating(email, id, callback) {
	User.findOne({
		'local.username': email,
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else if (result) {
			if ((result.rating.likes).indexOf(id) > -1) {
				callback(1);
			} else if ((result.rating.dislikes).indexOf(id) > -1) {
				callback(-1);
			} else {
				callback(0);
			}
		} else {
			console.log("FATAL ERROR");
			callback(404);
		}
	});
}

function pushUserRating(email, flag, id, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$push: {
				'rating.likes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	} else if (flag == 0) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$push: {
				'rating.dislikes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	}
}

function pullUserRating(email, flag, id, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$pull: {
				'rating.likes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	} else if (flag == 0) {
		User.findOneAndUpdate({
			'local.username': email
		},
		{
			$pull: {
				'rating.dislikes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	}
}

function getRatings(email, callback) {
	User.findOne({
		'local.username': email,
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result.rating);
		}
	});
}





exports.findRating = findRating;
exports.pushUserRating = pushUserRating;
exports.pullUserRating = pullUserRating;
exports.getRatings = getRatings;


exports.updateCategory = updateCategory;
exports.retrieve = retrieve;
exports.updateIdea = updateIdea;
exports.createIdea = createIdea;
exports.getUserIdeas = getUserIdeas;
exports.deleteIdea = deleteIdea;
exports.getOtherIdeas = getOtherIdeas;
exports.setFilter = setFilter;
