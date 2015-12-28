var app = angular.module('main', ['ui.bootstrap', 'ngAnimate', 'toastr', 'btford.socket-io']);
app.controller('MainController', function($scope, $modal, $http, $window, toastr, Socket) {

	var refresh = function() {
		$scope.currentDate = new Date();
		$scope.sectionName = 'ideaMain';
		var currentUser = $window.user;
		$scope.techiUser = $window.user;
		$scope.filterTags = currentUser.filter.join(';');
		$scope.token = currentUser._id;
		$scope.displayName=currentUser.name;
		$scope.username = currentUser.local.username;
		$scope.categoryPreference = currentUser.categoryPreference;
		$scope.sortingPreferenceOrder = currentUser.sortingPreference.order;
		$scope.sortingPreferenceSortBy = currentUser.sortingPreference.sortBy;
		
		if(!currentUser.profile.picture){
			$scope.logoSrc="../img/userlogo2.jpg";}
		else{
			$scope.logoSrc=currentUser.profile.picture;
		}

		$http.get('/api/getUserIdeas' + '?access_token=' + $scope.token, {
			username: $scope.username
		}).success(function(response) {
			$scope.userIdeas = response;
		});
		$http.get('/api/getOtherIdeas' + '?access_token=' + $scope.token).success(function(response) {
			$scope.otherIdeas = response;
		});
		$http.get('/api/getRatings' + '?access_token=' + $scope.token).success(function(response) {
			$scope.ratings = response;
		});
	};
	refresh();

	$scope.swapView = function(currentView) {
		$scope.sectionName = currentView;
	}

	$scope.logout = function() {
		$window.location.href = '/auth/logout';
	}

	$scope.create = function() {
		var modalInstance = $modal.open({
			templateUrl: '/partials/modal_idea.html',
			controller: 'MainModalController',
			resolve: {
				input: function() {
					return {
						title: '',
						description: '',
						category: '',
						tags: [],
						pagetext: 'Creating'
					};
				}
			}
		});

		modalInstance.result.then(function(result) {
			var str = "{ title: '" + result.title + "', description: '" + result.description + "', username: '" + $scope.username + "', category: '" + result.category + "', tags: ['";
			var i;
			for (i = 0; i < result.tags.length; i++) {
				str += result.tags[i] + "', '";
			}
			str = str.substring(0, str.length - 4) + "'] }";
			var data = JSON.stringify(eval("(" + str + ")"));
			$scope.update(null, data); // call update to create an idea
		});
	}

	$scope.edit = function(id, title, description, category, tags, likes, dislikes, notShow) {
		var modalInstance = $modal.open({
			templateUrl: '/partials/modal_idea.html',
			controller: 'MainModalController',
			resolve: {
				input: function() {
					return {
						title: title,
						description: description,
						category: category,
						tags: tags,
						pagetext: 'Editing'
					};
				}
			}
		});

		modalInstance.result.then(function(result) {
			var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
			var i;
			for (i = 0; i < result.tags.length; i++) {
				str += result.tags[i] + "', '";
			}
			str = str.substring(0, str.length - 4) + "'], likes: 0, dislikes: 0 }";
			var data = JSON.stringify(eval("(" + str + ")"));
			$scope.update(id, data);
		});
	}

	$scope.update = function(id, data) {
		if (id == null) {
			$http.post('/api/createIdea' + '?access_token=' + $scope.token, data).success(function(response) {
				if (response) {
					refresh();
				}
				else {
					console.log("Fail to add Idea");
				}
			});
		}
		else {
			$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, data).success(function(response) {
				if (response) {
					refresh();
				}
				else {
					console.log("Fail");
				}
			});
		}
	}

	$scope.remove = function(id, title, description, category, tags) {
		$http.delete('/api/idea', {
			params: {
				id: id,
				access_token: $scope.token
			}
		}).success(function(response) {
			if (response) {
				refresh();
			}
			else {
				console.log("Fail");
			}
		});
	}

	//----------------------------------likes disliks--------------------------------//

	$scope.like = function(id, title, description, category, tags) {
		$http.get('/api/findRating' + '?access_token=' + $scope.token + '&id=' + id).success(function(response) {
			if (response == 1) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 1,
					flag: -1
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: -1,
						dislikes: 0
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
			else if (response == 0) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 1,
					flag: 1
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 1,
						dislikes: 0
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
			else if (response == -1) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 1,
					flag: 0
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 1,
						dislikes: -1
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
		});
	}

	$scope.dislike = function(id, title, description, category, tags) {
		$http.get('/api/findRating' + '?access_token=' + $scope.token + '&id=' + id).success(function(response) {
			if (response == -1) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 0,
					flag: -1
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 0,
						dislikes: -1
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
			else if (response == 0) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 0,
					flag: 1
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 0,
						dislikes: 1
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
			else if (response == 1) {
				$http.put('/api/userlike' + '?access_token=' + $scope.token, {
					id: id,
					compare: 0,
					flag: 0
				}).success(function(response) {
					$http.put('/api/idea' + '?access_token=' + $scope.token + '&id=' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: -1,
						dislikes: 1
					}).success(function(response) {
						if (response) {
							refresh();
						}
						else {
							console.log("error");
						}
					});
				});
			}
		});
	}

	// -----------------------------Filters controlled by Backends API----------------------------//

	$scope.toggle = function(category) {
		if (($scope.categoryPreference).indexOf(category) > -1) {
			//remove
			$http.put('/api/updateCategory' + '?access_token=' + $scope.token, {
				category: category,
				flag: 0
			}).success(function(response) {
				$scope.categoryPreference = response.categoryPreference;
				$http.get('/api/getOtherIdeas' + '?access_token=' + $scope.token).success(function(response) {
					$scope.otherIdeas = response;
				});
			});
		}
		else {
			//add
			$http.put('/api/updateCategory' + '?access_token=' + $scope.token, {
				category: category,
				flag: 1
			}).success(function(response) {
				$scope.categoryPreference = response.categoryPreference;
				$http.get('/api/getOtherIdeas' + '?access_token=' + $scope.token).success(function(response) {
					$scope.otherIdeas = response;
				});
			});
		}
	}

	$scope.clearFilter = function() {
		$http.post('/api/setFilter' + '?access_token=' + $scope.token, {
			clear: 1,
			tags: ""
		}).success(function(response) {
			$scope.filterTags = ""
			$http.get('/api/getOtherIdeas' + '?access_token=' + $scope.token).success(function(response) {
				$scope.otherIdeas = response;
			});
			$http.get('/api/getRatings' + '?access_token=' + $scope.token).success(function(response) {
				$scope.ratings = response;
			});
		});
	}

	$scope.filter = function() {
		if ($scope.filterTags != "") {
			$http.post('/api/setFilter' + '?access_token=' + $scope.token, {
				clear: 0,
				tags: $scope.filterTags
			}).success(function(response) {
				$http.get('/api/getOtherIdeas' + '?access_token=' + $scope.token).success(function(response) {
					$scope.otherIdeas = response;
				});
				$http.get('/api/getRatings' + '?access_token=' + $scope.token).success(function(response) {
					$scope.ratings = response;
				});
			});
		}
		else {
			toastr.error('Please enter tags to filter', 'Error');
		}
	}

	$scope.retrieve = function(posInt,sdate,edate) {
		if (posInt > 0) {
			edate.setHours(0);
			edate.setMinutes(0);
			edate.setSeconds(0);
			$http.post('/api/retrieve' + '?access_token=' + $scope.token, {
				posInt: posInt,
				sdate: sdate,
				edate: edate
			}).success(function(response) {
				$scope.retrieveModal(response);
			});
		}
		else {
			toastr.warning('Please enter the number of results you would like to receive', 'Warning');
		}
	}

	$scope.retrieveModal = function(response) {
		var modalInstance = $modal.open({
			templateUrl: '/partials/modal_retrieve.html',
			controller: 'RetrieveModalController',
			size: "lg",
			resolve: {
				input: function() {
					return response;
				}
			}
		});
	}

	$scope.viewIdea = function(id, title, description, category, tags, likes, dislikes, notShow) {
		var modalInstance = $modal.open({
			templateUrl: '/partials/modal_idea.html',
			controller: 'MainModalController',
			resolve: {
				input: function() {
					return {
						title: title,
						description: description,
						category: category,
						tags: tags,
						notShow: notShow
					};
				}
			}
		});
	}

	// --------------------- Angularjs Filters much simpler than doing with api lol -----------------------------//

	$scope.predicate = 'title';
	$scope.reverse = true;
	$scope.sort = function(predicate) {
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		$scope.predicate = predicate;
	};

	$scope.myFilter = {};

	$scope.myInterval = 1000;
	$scope.slides = [{
		image: "../img/underdev3.jpg"
	}, {
		image: "../img/underdev2.jpg"
	}, {
		image: "../img/underdev1.jpg"
	}];
	
	
	
// --------------------- Chatroom -----------------------------//
	
	Socket.connect();
	
	$scope.leaveChat= function(){
        Socket.disconnect(true);
        $scope.sectionName='ideaMain';
    }
    
    $scope.sendMessage = function(msg){
        if(msg != null && msg != '')
            Socket.emit('message', {message: msg})
        $scope.msg = '';
    }
    
	$scope.chatUsers=[];
	$scope.messages=[];

	Socket.emit('add-user', {displayName: $scope.displayName})
	Socket.emit('request-users', {});
	
	Socket.on('users', function(data){
        $scope.chatUsers = data.chatUsers;
    });
    
    Socket.on('message', function(data){
    	console.log($scope.messages);
        $scope.messages.push(data);
    });
    
    Socket.on('add-user', function(data){
        $scope.chatUsers.push(data.displayName);
        $scope.messages.push({displayName: data.displayName, message: 'has entered the channel'});
    });
    
    Socket.on('remove-user', function(data){
        $scope.chatUsers.splice($scope.chatUsers.indexOf(data.displayName), 1);
        $scope.messages.push({displayName: data.displayName, message: 'has left the channel'});
    });
	
});

//----------------------------MainModal Controller-------------------------------------//

app.controller('MainModalController', function($scope, $modalInstance, toastr, input) {
	$scope.removeDuplicates = function(source) {
		var tag = "";
		var i;
		for (i = 0; i < source.length; i++) {
			if (tag.indexOf(source[i].trim()) == -1) {
				tag += source[i].trim() + ';';
			}
		}
		return tag;
	}

	$scope.checkError = function(object) {
		return (object === undefined || object === '' || (object[0] == '' && object.length == 1));
	}

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.pagetext = input.pagetext;
	$scope.title = input.title;
	$scope.description = input.description;
	$scope.category = input.category;
	$scope.tags = $scope.removeDuplicates(input.tags);
	$scope.notShow = input.notShow;

	$scope.submit = function() {
		var correctTags = ($scope.tags.replace(/;+/g, ";")).replace(/'/g, "\\'");

		if (correctTags.charAt(correctTags.length - 1) == ';') {
			correctTags = correctTags.substring(0, correctTags.length - 1)
		}

		if (correctTags.charAt(0) == ';') {
			correctTags = correctTags.substring(1, correctTags.length)
		}

		correctTags = correctTags.split(';');

		var tags = $scope.removeDuplicates(correctTags);
		tags = tags.substring(0, tags.length - 1).split(';');

		if ($scope.checkError($scope.title)) {
			toastr.error('Please specify a title', 'Error');
		}
		else if ($scope.checkError($scope.description)) {
			toastr.error('Please enter a desciption for your idea', 'Error');
		}
		else if ($scope.checkError($scope.category)) {
			toastr.error('Please select a category for this idea', 'Error');
		}
		else if ($scope.checkError(tags)) {
			toastr.error('Please enter some keywords/tags for your idea', 'Error');
		}
		else {
			$modalInstance.close({
				title: $scope.title,
				description: $scope.description,
				category: $scope.category,
				tags: tags
			});
		}
	};
});

app.controller('RetrieveModalController', function($scope, $modalInstance, input) {
	$scope.response = input;
});

app.config(function(toastrConfig) {
	angular.extend(toastrConfig, {
		closeButton: true,
		maxOpened: 1,
		timeOut: 2500
	});
});

app.factory('Socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}])