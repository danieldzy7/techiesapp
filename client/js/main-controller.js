/**
 * Main Controller for Techies App
 * Handles user interface logic, data management, and user interactions
 */

const app = angular.module('main', ['ui.bootstrap', 'ngAnimate', 'toastr', 'btford.socket-io']);

app.controller('MainController', function($scope, $modal, $http, makeIdeaChart, $window, toastr, Socket) {

	// ============================================================================
	// INITIALIZATION & SETUP
	// ============================================================================

	/**
	 * Initialize application data and user session
	 */
	const initializeApp = function() {
		$scope.currentDate = new Date();
		$scope.sectionName = 'ideaMain';
		
		// Validate user session
		if (!$window.user) {
			console.error('User data not available');
			$window.location.href = '/auth';
			return;
		}
		
		// Set user data
		const currentUser = $window.user;
		$scope.techiUser = currentUser;
		$scope.filterTags = currentUser.filter ? currentUser.filter.join(';') : '';
		$scope.token = currentUser._id;
		$scope.displayName = currentUser.name || 'User';
		$scope.username = currentUser.local ? currentUser.local.username : '';
		
		// Initialize pagination
		$scope.currentPage = $scope.currentPage || 1;
		$scope.otherIdeasCurrentPage = $scope.otherIdeasCurrentPage || 1;
		
		// Add Math to scope for template access
		$scope.Math = Math;
		
		// Set user preferences
		$scope.categoryPreference = currentUser.categoryPreference || [];
		$scope.sortingPreferenceOrder = currentUser.sortingPreference ? currentUser.sortingPreference.order : 1;
		$scope.sortingPreferenceSortBy = currentUser.sortingPreference ? currentUser.sortingPreference.sortBy : 'date';

		// Set user profile picture
		setUserProfilePicture(currentUser);
		
		// Load initial data
		loadUserData();
	};

	/**
	 * Set user profile picture based on authentication provider
	 */
	const setUserProfilePicture = function(currentUser) {
		if (!currentUser.profile || !currentUser.profile.picture) {
			$scope.logoSrc = "../img/logo1.jpg";
			return;
		}

		if (currentUser.tokens && currentUser.tokens[0]) {
			const token = currentUser.tokens[0];
			if (token.kind === 'google') {
				const pictureUrl = currentUser.profile.picture;
				$scope.logoSrc = pictureUrl.substr(0, pictureUrl.indexOf('?sz=')) + '?sz=175';
			} else if (token.kind === 'facebook') {
				$scope.logoSrc = currentUser.profile.picture;
			}
		}
	};

	/**
	 * Load user data from API
	 */
	const loadUserData = function() {
		// Load user ideas
		$http.get('/api/getUserIdeas?access_token=' + $scope.token, {
			username: $scope.username
		}).success(function(response) {
			$scope.userIdeas = response;
			$scope.updatePagination();
		});

		// Load other users' ideas
		$http.get('/api/getOtherIdeas?access_token=' + $scope.token)
			.success(function(response) {
				$scope.otherIdeas = response;
			});

		// Load user ratings
		$http.get('/api/getRatings?access_token=' + $scope.token)
			.success(function(response) {
				$scope.ratings = response;
			});
		
		// Generate charts
		makeIdeaChart($scope.token);
	};

	// Initialize the application
	initializeApp();

	// ============================================================================
	// NAVIGATION & VIEW MANAGEMENT
	// ============================================================================

	/**
	 * Switch between different application views
	 */
	$scope.swapView = function(currentView) {
		$scope.sectionName = currentView;
		$scope.resetPagination();
		makeIdeaChart($scope.token);
	};

	/**
	 * Logout user and redirect to auth page
	 */
	$scope.logout = function() {
		$window.location.href = '/auth/logout';
	};

	// ============================================================================
	// IDEA MANAGEMENT
	// ============================================================================

	/**
	 * Open modal to create a new idea
	 */
	$scope.create = function() {
		const modalInstance = $modal.open({
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
			const data = {
				title: result.title,
				description: result.description,
				category: result.category,
				tags: result.tags
			};
			$scope.update(null, data);
		});
	};

	/**
	 * Open modal to edit an existing idea
	 */
	$scope.edit = function(id, title, description, category, tags, likes, dislikes, notShow) {
		const modalInstance = $modal.open({
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
			const data = {
				title: result.title,
				description: result.description,
				category: result.category,
				tags: result.tags,
				likes: 0,
				dislikes: 0
			};
			$scope.update(id, data);
		});
	};

	/**
	 * Create or update an idea
	 */
	$scope.update = function(id, data) {
		if (id == null) {
			// Create new idea
			$http.post('/api/createIdea?access_token=' + $scope.token, data)
				.success(function(response) {
					if (response) {
						initializeApp();
					} else {
						console.log("Failed to add idea");
					}
				})
				.error(function(err) {
					console.log("Error creating idea:", err);
				});
		} else {
			// Update existing idea
			$http.put('/api/idea?access_token=' + $scope.token + '&id=' + id, data)
				.success(function(response) {
					if (response) {
						initializeApp();
					} else {
						console.log("Failed to update idea");
					}
				})
				.error(function(err) {
					console.log("Error updating idea:", err);
				});
		}
	};

	/**
	 * Remove an idea
	 */
	$scope.remove = function(id, title, description, category, tags) {
		$http.delete('/api/idea', {
			params: {
				id: id,
				access_token: $scope.token
			}
		}).success(function(response) {
			if (response) {
				initializeApp();
			} else {
				console.log("Failed to remove idea");
			}
		});
	};

	// ============================================================================
	// RATING SYSTEM
	// ============================================================================

	/**
	 * Handle like action on an idea
	 */
	$scope.like = function(id, title, description, category, tags) {
		$http.get('/api/findRating?access_token=' + $scope.token + '&id=' + id)
			.success(function(response) {
				handleRatingAction(id, title, description, category, tags, response, 1);
			});
	};

	/**
	 * Handle dislike action on an idea
	 */
	$scope.dislike = function(id, title, description, category, tags) {
		$http.get('/api/findRating?access_token=' + $scope.token + '&id=' + id)
			.success(function(response) {
				handleRatingAction(id, title, description, category, tags, response, -1);
			});
	};

	/**
	 * Process rating action based on current state
	 */
	const handleRatingAction = function(id, title, description, category, tags, currentRating, action) {
		let flag, likes, dislikes;
		
		if (action === 1) { // Like action
			if (currentRating === 1) {
				flag = -1; likes = -1; dislikes = 0; // Unlike
			} else if (currentRating === 0) {
				flag = 1; likes = 1; dislikes = 0; // Like
			} else if (currentRating === -1) {
				flag = 0; likes = 1; dislikes = -1; // Change from dislike to like
			}
		} else { // Dislike action
			if (currentRating === -1) {
				flag = -1; likes = 0; dislikes = -1; // Undislike
			} else if (currentRating === 0) {
				flag = 1; likes = 0; dislikes = 1; // Dislike
			} else if (currentRating === 1) {
				flag = 0; likes = -1; dislikes = 1; // Change from like to dislike
			}
		}

		// Update user rating
		$http.put('/api/userlike?access_token=' + $scope.token, {
			id: id,
			compare: action === 1 ? 1 : 0,
			flag: flag
		}).success(function(response) {
			// Update idea rating
			$http.put('/api/idea?access_token=' + $scope.token + '&id=' + id, {
				title: title,
				description: description,
				category: category,
				tags: tags,
				likes: likes,
				dislikes: dislikes
			}).success(function(response) {
				if (response) {
					initializeApp();
				} else {
					console.log("Error updating rating");
				}
			});
		});
	};

	// ============================================================================
	// FILTERING & SORTING
	// ============================================================================

	/**
	 * Toggle category preference
	 */
	$scope.toggle = function(category) {
		const isSelected = $scope.categoryPreference.indexOf(category) > -1;
		const flag = isSelected ? 0 : 1; // 0 to remove, 1 to add
		
		$http.put('/api/updateCategory?access_token=' + $scope.token, {
			category: category,
			flag: flag
		}).success(function(response) {
			$scope.categoryPreference = response.categoryPreference;
			$http.get('/api/getOtherIdeas?access_token=' + $scope.token)
				.success(function(response) {
					$scope.otherIdeas = response;
				});
		});
	};

	/**
	 * Clear all filters
	 */
	$scope.clearFilter = function() {
		$http.post('/api/setFilter?access_token=' + $scope.token, {
			clear: 1,
			tags: ""
		}).success(function(response) {
			$scope.filterTags = "";
			$http.get('/api/getOtherIdeas?access_token=' + $scope.token)
				.success(function(response) {
					$scope.otherIdeas = response;
				});
			$http.get('/api/getRatings?access_token=' + $scope.token)
				.success(function(response) {
					$scope.ratings = response;
				});
		});
	};

	/**
	 * Apply tag filter
	 */
	$scope.filter = function() {
		if ($scope.filterTags !== "") {
			$http.post('/api/setFilter?access_token=' + $scope.token, {
				clear: 0,
				tags: $scope.filterTags
			}).success(function(response) {
				$http.get('/api/getOtherIdeas?access_token=' + $scope.token)
					.success(function(response) {
						$scope.otherIdeas = response;
					});
				$http.get('/api/getRatings?access_token=' + $scope.token)
					.success(function(response) {
						$scope.ratings = response;
					});
			});
		} else {
			toastr.error('Please enter tags to filter', 'Error');
		}
	};

	/**
	 * Retrieve ideas by date range
	 */
	$scope.retrieve = function(posInt, sdate, edate) {
		if (posInt > 0) {
			edate.setHours(0);
			edate.setMinutes(0);
			edate.setSeconds(0);
			$http.post('/api/retrieve?access_token=' + $scope.token, {
				posInt: posInt,
				sdate: sdate,
				edate: edate,
				cache: true
			}).success(function(response) {
				$scope.retrieveModal(response);
			});
		} else {
			toastr.warning('Please enter the number of results you would like to receive', 'Warning');
		}
	};

	/**
	 * Open retrieve results modal
	 */
	$scope.retrieveModal = function(response) {
		const modalInstance = $modal.open({
			templateUrl: '/partials/modal_retrieve.html',
			controller: 'RetrieveModalController',
			size: "lg",
			resolve: {
				input: function() {
					return response;
				}
			}
		});
	};

	/**
	 * View idea details
	 */
	$scope.viewIdea = function(id, title, description, category, tags, likes, dislikes, notShow) {
		const modalInstance = $modal.open({
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
	};

	// ============================================================================
	// SORTING & PAGINATION
	// ============================================================================

	// Sorting configuration
	$scope.predicate = 'title';
	$scope.reverse = true;
	
	/**
	 * Sort table by column
	 */
	$scope.sort = function(predicate) {
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		$scope.predicate = predicate;
	};

	// Filter and pagination configuration
	$scope.myFilter = {};
	$scope.selectedCategory = '';
	$scope.pageSize = 6;

	/**
	 * Get filtered user ideas
	 */
	$scope.filteredUserIdeas = function() {
		if (!$scope.userIdeas) return [];
		
		const filtered = $scope.userIdeas.filter(function(idea) {
			if (!$scope.myFilter.category) return true;
			return idea.category === $scope.myFilter.category;
		});
		
		console.log('Filtered ideas:', filtered.length, 'Total ideas:', $scope.userIdeas.length, 'Current page:', $scope.currentPage);
		return filtered;
	};

	/**
	 * Get pagination pages array
	 */
	$scope.getPages = function(data) {
		const totalPages = Math.ceil(data.length / $scope.pageSize);
		const pages = [];
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i);
		}
		console.log('Pages:', pages, 'Total pages:', totalPages, 'Data length:', data.length, 'Page size:', $scope.pageSize);
		return pages;
	};

	/**
	 * Get total number of pages
	 */
	$scope.getTotalPages = function(data) {
		const total = Math.ceil(data.length / $scope.pageSize);
		console.log('Total pages for data:', total, 'Data length:', data.length);
		return total;
	};

	/**
	 * Reset pagination to first page
	 */
	$scope.resetPagination = function() {
		$scope.currentPage = 1;
	};

	/**
	 * Update pagination when data changes
	 */
	$scope.updatePagination = function() {
		const filteredData = $scope.userIdeas ? $scope.userIdeas.filter(function(idea) {
			if (!$scope.myFilter.category) return true;
			return idea.category === $scope.myFilter.category;
		}) : [];
		
		const totalPages = Math.ceil(filteredData.length / $scope.pageSize);
		if ($scope.currentPage > totalPages && totalPages > 0) {
			$scope.currentPage = totalPages;
		}
		console.log('Updated pagination - Total pages:', totalPages, 'Current page:', $scope.currentPage);
	};

	/**
	 * Handle page change for My Ideas
	 */
	$scope.changePage = function(page) {
		$scope.currentPage = page;
		console.log('My Ideas page changed to:', page);
	};

	/**
	 * Handle page change for Other Ideas
	 */
	$scope.changeOtherIdeasPage = function(page) {
		$scope.otherIdeasCurrentPage = page;
		console.log('Other Ideas page changed to:', page);
	};

	// ============================================================================
	// SAMPLE DATA GENERATION
	// ============================================================================

	/**
	 * Create sample data for testing
	 */
	$scope.createSampleData = function() {
		// Sample data arrays for realistic idea generation
		const sampleTitles = [
			"Smart Home Energy Management System",
			"AI-Powered Personal Fitness Coach",
			"Blockchain-Based Supply Chain Tracker",
			"Virtual Reality Education Platform",
			"Mobile Health Monitoring App",
			"Eco-Friendly Transportation Solution",
			"Digital Wallet for Cryptocurrencies",
			"Smart Agriculture Monitoring System",
			"Language Learning with AI",
			"Remote Work Collaboration Tool",
			"Personal Finance Budget Tracker",
			"Mental Health Support App",
			"Smart City Traffic Management",
			"Online Course Marketplace",
			"Investment Portfolio Analyzer",
			"Travel Planning Assistant",
			"Healthcare Appointment Scheduler",
			"Code Review Automation Tool",
			"Environmental Impact Calculator",
			"Social Media Analytics Platform"
		];

		const sampleDescriptions = [
			"An intelligent system that optimizes home energy consumption using machine learning algorithms and IoT sensors.",
			"Personalized fitness coaching app that adapts to your progress and provides real-time feedback.",
			"Transparent supply chain tracking using blockchain technology for better accountability.",
			"Immersive educational experiences using VR technology for enhanced learning.",
			"Comprehensive health monitoring with wearable device integration and medical insights.",
			"Sustainable transportation solution reducing carbon footprint in urban areas.",
			"Secure digital wallet supporting multiple cryptocurrencies with advanced security features.",
			"Precision agriculture system using sensors and data analytics for optimal crop management.",
			"AI-driven language learning platform with personalized curriculum and speech recognition.",
			"Enhanced collaboration tools for remote teams with real-time communication features.",
			"Intelligent budget tracking with spending analysis and financial goal setting.",
			"Mental wellness app providing support, meditation, and professional counseling access.",
			"Smart traffic management system reducing congestion and improving urban mobility.",
			"Comprehensive platform for creating and selling online courses with interactive features.",
			"Advanced portfolio analysis tool with risk assessment and investment recommendations.",
			"AI-powered travel planning with personalized recommendations and itinerary optimization.",
			"Streamlined healthcare appointment booking with doctor reviews and insurance integration.",
			"Automated code review system improving code quality and development efficiency.",
			"Environmental impact assessment tool for businesses and individuals.",
			"Comprehensive social media analytics with competitor analysis and trend prediction."
		];

		const sampleTags = [
			["iot", "automation"],
			["fitness", "ai"],
			["blockchain", "security"],
			["vr", "education"],
			["health", "monitoring"],
			["transportation", "eco-friendly"],
			["cryptocurrency", "wallet"],
			["agriculture", "iot"],
			["language", "ai"],
			["collaboration", "remote-work"],
			["finance", "budget"],
			["mental-health", "wellness"],
			["traffic", "smart-city"],
			["education", "online-courses"],
			["finance", "investment"],
			["travel", "ai"],
			["healthcare", "appointments"],
			["code-review", "automation"],
			["environmental", "impact"],
			["social-media", "analytics"]
		];

		const categories = ["Health", "Technology", "Education", "Finance", "Travel"];

		// Create 50 sample ideas
		const promises = [];
		for (let i = 0; i < 50; i++) {
			const randomTitleIndex = Math.floor(Math.random() * sampleTitles.length);
			const randomDescriptionIndex = Math.floor(Math.random() * sampleDescriptions.length);
			const randomTagsIndex = Math.floor(Math.random() * sampleTags.length);
			const randomCategory = categories[Math.floor(Math.random() * categories.length)];
			const randomLikes = Math.floor(Math.random() * 50);
			const randomDislikes = Math.floor(Math.random() * 10);

			const sampleIdea = {
				title: sampleTitles[randomTitleIndex] + " " + (i + 1),
				description: sampleDescriptions[randomDescriptionIndex],
				category: randomCategory,
				tags: sampleTags[randomTagsIndex],
				likes: randomLikes,
				dislikes: randomDislikes
			};

			const promise = $http.post('/api/createIdea?access_token=' + $scope.token, sampleIdea);
			promises.push(promise);
		}

		// Show loading message
		toastr.info('Creating 50 sample ideas...', 'Please wait');

		// Wait for all promises to complete
		Promise.all(promises).then(function() {
			toastr.success('Successfully created 50 sample ideas!', 'Sample Data Created');
			initializeApp();
		}).catch(function(error) {
			console.error('Error creating sample data:', error);
			toastr.error('Error creating sample data. Please try again.', 'Error');
		});
	};

	/**
	 * Create sample users with ideas
	 */
	$scope.createSampleUsers = function() {
		toastr.info('Creating sample users with ideas...', 'Please wait');

		$http.post('/api/createSampleUsers?access_token=' + $scope.token)
			.success(function(response) {
				if (response.success) {
					toastr.success(response.message, 'Sample Users Created');
					initializeApp();
				} else {
					toastr.error(response.message, 'Error');
				}
			})
			.error(function(err) {
				console.error('Error creating sample users:', err);
				toastr.error('Error creating sample users. Please try again.', 'Error');
			});
	};

	/**
	 * Clear all data for current user
	 */
	$scope.clearAllData = function() {
		if (confirm('Are you sure you want to delete ALL your ideas? This action cannot be undone!')) {
			toastr.info('Clearing all your ideas...', 'Please wait');

			$http.post('/api/clearAllUserIdeas?access_token=' + $scope.token)
				.success(function(response) {
					if (response.success) {
						toastr.success(response.message, 'Data Cleared');
						initializeApp();
					} else {
						toastr.error(response.message, 'Error');
					}
				})
				.error(function(err) {
					console.error('Error clearing data:', err);
					toastr.error('Error clearing data. Please try again.', 'Error');
				});
		}
	};

	/**
	 * Remove all data from entire database
	 */
	$scope.removeAllData = function() {
		const warningMessage = '⚠️ WARNING: This will delete ALL data from the entire database!\n\n' +
			'This includes:\n• All ideas from all users\n• All ratings and interactions\n\n' +
			'This action cannot be undone!\n\nAre you absolutely sure you want to continue?';
		
		if (confirm(warningMessage)) {
			toastr.warning('Removing all data from database...', 'Please wait');

			$http.post('/api/removeAllData?access_token=' + $scope.token)
				.success(function(response) {
					if (response.success) {
						toastr.success(response.message, 'Database Cleared');
						initializeApp();
					} else {
						toastr.error(response.message, 'Error');
					}
				})
				.error(function(err) {
					console.error('Error removing all data:', err);
					toastr.error('Error removing all data. Please try again.', 'Error');
				});
		}
	};

	// ============================================================================
	// CHAT ROOM FUNCTIONALITY
	// ============================================================================

	// Initialize Socket.IO connection
	Socket.connect();

	/**
	 * Leave chat room
	 */
	$scope.leaveChat = function() {
		Socket.disconnect(true);
		$scope.sectionName = 'ideaMain';
	};

	/**
	 * Send chat message
	 */
	$scope.sendMessage = function(msg) {
		if (msg != null && msg !== '') {
			Socket.emit('message', {
				message: msg
			});
			$scope.msg = '';
		}
	};

	// Chat room data
	$scope.chatUsers = [];
	$scope.messages = [];

	// Add user to chat room
	Socket.emit('add-user', {
		displayName: $scope.displayName
	});
	
	// Request current users
	Socket.emit('request-users', {});

	// Socket event listeners
	Socket.on('chatUsers', function(data) {
		$scope.chatUsers = data.chatUsers;
		$scope.$apply();
	});

	Socket.on('message', function(data) {
		console.log('Received message:', data);
		$scope.messages.push(data);
		$scope.$apply();
	});

	Socket.on('add-user', function(data) {
		$scope.chatUsers.push(data.displayName);
		$scope.messages.push({
			displayName: data.displayName,
			message: 'has entered the channel'
		});
		$scope.$apply();
	});

	Socket.on('remove-user', function(data) {
		const index = $scope.chatUsers.indexOf(data.displayName);
		if (index > -1) {
			$scope.chatUsers.splice(index, 1);
		}
		$scope.messages.push({
			displayName: data.displayName,
			message: 'has left the channel'
		});
		$scope.$apply();
	});

	// Handle connection errors
	Socket.on('connect_error', function(error) {
		console.error('Socket.IO connection error:', error);
		toastr.error('Chat room connection failed', 'Connection Error');
	});

	Socket.on('connect', function() {
		console.log('Connected to chat room');
	});

	// ============================================================================
	// UTILITY FUNCTIONS
	// ============================================================================

	/**
	 * Placeholder function for under development features
	 */
	$scope.notYet = function() {
		toastr.error('LOL I just PUT a button there :P  Underdev');
	};

	// Carousel configuration
	$scope.myInterval = 1000;
	$scope.slides = [{
		image: "../img/underdev3.jpg"
	}, {
		image: "../img/underdev2.jpg"
	}, {
		image: "../img/underdev1.jpg"
	}];

});

// ============================================================================
// MODAL CONTROLLERS
// ============================================================================

/**
 * Main Modal Controller for idea creation/editing
 */
app.controller('MainModalController', function($scope, $modalInstance, toastr, input) {
	
	/**
	 * Remove duplicate tags
	 */
	$scope.removeDuplicates = function(source) {
		let tag = "";
		for (let i = 0; i < source.length; i++) {
			if (tag.indexOf(source[i].trim()) === -1) {
				tag += source[i].trim() + ';';
			}
		}
		return tag;
	};

	/**
	 * Check for validation errors
	 */
	$scope.checkError = function(object) {
		return (object === undefined || object === '' || (object[0] === '' && object.length === 1));
	};

	/**
	 * Cancel modal
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	// Initialize modal data
	$scope.pagetext = input.pagetext;
	$scope.title = input.title;
	$scope.description = input.description;
	$scope.category = input.category;
	$scope.tags = $scope.removeDuplicates(input.tags);
	$scope.notShow = input.notShow;

	/**
	 * Submit modal form
	 */
	$scope.submit = function() {
		let correctTags = ($scope.tags.replace(/;+/g, ";")).replace(/'/g, "\\'");

		if (correctTags.charAt(correctTags.length - 1) === ';') {
			correctTags = correctTags.substring(0, correctTags.length - 1);
		}

		if (correctTags.charAt(0) === ';') {
			correctTags = correctTags.substring(1, correctTags.length);
		}

		correctTags = correctTags.split(';');

		const tags = $scope.removeDuplicates(correctTags);
		const finalTags = tags.substring(0, tags.length - 1).split(';');

		// Validation
		if ($scope.checkError($scope.title)) {
			toastr.error('Please specify a title', 'Error');
		} else if ($scope.checkError($scope.description)) {
			toastr.error('Please enter a description for your idea', 'Error');
		} else if ($scope.checkError($scope.category)) {
			toastr.error('Please select a category for this idea', 'Error');
		} else if ($scope.checkError(finalTags)) {
			toastr.error('Please enter some keywords/tags for your idea', 'Error');
		} else {
			$modalInstance.close({
				title: $scope.title,
				description: $scope.description,
				category: $scope.category,
				tags: finalTags
			});
		}
	};
});

/**
 * Retrieve Modal Controller
 */
app.controller('RetrieveModalController', function($scope, $modalInstance, input) {
	$scope.response = input;
});

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Toastr configuration
 */
app.config(function(toastrConfig) {
	angular.extend(toastrConfig, {
		closeButton: true,
		maxOpened: 1,
		timeOut: 2500
	});
});

// ============================================================================
// FACTORIES & SERVICES
// ============================================================================

/**
 * Socket.IO factory
 */
app.factory('Socket', ['socketFactory', function(socketFactory) {
	return socketFactory();
}]);

/**
 * Chart generation factory
 */
app.factory('makeIdeaChart', ['$http', function($http) {
	return function(token) {
		$http.get('/api/categoryCount?access_token=' + token)
			.success(function(response) {
				// Ensure response has the expected properties
				const data = {
					health: response.health || 0,
					technology: response.technology || 0,
					education: response.education || 0,
					finance: response.finance || 0,
					travel: response.travel || 0
				};
				
				// Create column chart
				const columnChart = AmCharts.makeChart("chartdiv", {
					"type": "serial",
					"theme": "none",
					"titles": [{
						"text": "Column Chart of Ideas Categories",
						"size": 16
					}],
					"dataProvider": [{
						"category": "Health",
						"visits": data.health,
						"color": "#337ab7"
					}, {
						"category": "Technology",
						"visits": data.technology,
						"color": "#5cb85c"
					}, {
						"category": "Education",
						"visits": data.education,
						"color": "#5bc0de"
					}, {
						"category": "Finance",
						"visits": data.finance,
						"color": "#f0ad4e"
					}, {
						"category": "Travel",
						"visits": data.travel,
						"color": "#d9534f"
					}],
					"valueAxes": [{
						"axisAlpha": 0,
						"position": "left",
						"title": "Number of ideas",
						"integersOnly": true
					}],
					"startDuration": 0,
					"graphs": [{
						"balloonText": "<b>[[category]]: [[value]]</b>",
						"fillColorsField": "color",
						"fillAlphas": 0.9,
						"lineAlpha": 0.2,
						"type": "column",
						"valueField": "visits"
					}],
					"chartCursor": {
						"categoryBalloonEnabled": false,
						"cursorAlpha": 0,
						"zoomable": false
					},
					"categoryField": "category",
					"categoryAxis": {
						"gridPosition": "start",
						"labelRotation": 20
					},
					"amExport": {}
				});

				// Create pie chart
				const pieChart = AmCharts.makeChart("chartdiv2", {
					"type": "pie",
					"theme": "light",
					"titles": [{
						"text": "Pie Chart of Ideas Categories",
						"size": 16
					}],
					"dataProvider": [{
						"category": "Health",
						"visits": data.health,
						"color": "#337ab7"
					}, {
						"category": "Technology",
						"visits": data.technology,
						"color": "#5cb85c"
					}, {
						"category": "Education",
						"visits": data.education,
						"color": "#5bc0de"
					}, {
						"category": "Finance",
						"visits": data.finance,
						"color": "#f0ad4e"
					}, {
						"category": "Travel",
						"visits": data.travel,
						"color": "#d9534f"
					}],
					"valueField": "visits",
					"titleField": "category",
					"startEffect": "elastic",
					"startDuration": 2,
					"labelRadius": 15,
					"innerRadius": "50%",
					"depth3D": 10,
					"balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
					"angle": 15,
					"export": {
						"enabled": true
					}
				});
			});
	};
}]);

// ============================================================================
// CUSTOM FILTERS
// ============================================================================

/**
 * Pagination filter
 */
app.filter('startFrom', function() {
	return function(data, start) {
		return data.slice(start);
	};
});






