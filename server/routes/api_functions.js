/**
 * API Functions for Techies App
 * Contains all business logic for idea management, user operations, and data processing
 * 
 * @author Daniel D
 * @version 1.0.0
 */

// ============================================================================
// DEPENDENCIES & IMPORTS
// ============================================================================
const User = require('../models/user');
const Idea = require('../models/idea');

// ============================================================================
// IDEA MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Create a new idea for a user
 * @param {string} title - Idea title
 * @param {string} description - Idea description
 * @param {string} category - Idea category
 * @param {Array} tags - Idea tags
 * @param {string} email - User email
 * @param {Function} callback - Callback function
 */
async function createIdea(title, description, category, tags, email, callback) {
	try {
		// Find user by email
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Create new idea
		const newIdea = new Idea({
			author: {
				'id': user._id,
				'name': user.name,
				'email': user.local.username
			},
			title: title,
			normalized: title.toLowerCase(),
			description: description,
			tags: tags,
			category: category
		});
		
		const result = await newIdea.save();
		callback(result);
	} catch (err) {
		console.error('Error creating idea:', err);
		throw err;
	}
}

/**
 * Get all ideas for a specific user
 * @param {string} email - User email
 * @param {Function} callback - Callback function
 */
async function getUserIdeas(email, callback) {
	try {
		// Find user by email
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Get user's ideas
		const ideas = await Idea.find({ 'author.id': user._id });
		callback(ideas);
	} catch (err) {
		console.error('Error getting user ideas:', err);
		throw err;
	}
}

/**
 * Update an existing idea
 * @param {string} id - Idea ID
 * @param {string} title - Updated title
 * @param {string} description - Updated description
 * @param {string} category - Updated category
 * @param {Array} tags - Updated tags
 * @param {number} likes - Like count change
 * @param {number} dislikes - Dislike count change
 * @param {Function} callback - Callback function
 */
async function updateIdea(id, title, description, category, tags, likes, dislikes, callback) {
	try {
		const updateData = {
			$set: {
				'title': title,
				'description': description,
				'category': category,
				'tags': tags
			}
		};

		// Add rating updates if provided
		if (likes !== undefined || dislikes !== undefined) {
			updateData.$inc = {};
			if (likes !== undefined) updateData.$inc['rating.likes'] = likes;
			if (dislikes !== undefined) updateData.$inc['rating.dislikes'] = dislikes;
		}

		const result = await Idea.findOneAndUpdate(
			{ '_id': id },
			updateData,
			{ new: true }
		);
		
		callback(result);
	} catch (err) {
		console.error('Error updating idea:', err);
		throw err;
	}
}

/**
 * Delete an idea
 * @param {string} id - Idea ID
 * @param {Function} callback - Callback function
 */
async function deleteIdea(id, callback) {
	try {
		const result = await Idea.deleteOne({ '_id': id });
		callback(result);
	} catch (err) {
		console.error('Error deleting idea:', err);
		throw err;
	}
}

/**
 * Get ideas from other users (filtered by user preferences)
 * @param {string} email - User email
 * @param {Function} callback - Callback function
 */
async function getOtherIdeas(email, callback) {
	try {
		// Find user by email
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Build query based on user preferences
		let query = { 'author.id': { $ne: user._id } };
		
		// Add category filter if user has preferences
		if (user.categoryPreference && user.categoryPreference.length > 0) {
			query.category = { $in: user.categoryPreference };
		}
		
		// Add tag filter if user has filter tags
		if (user.filter && user.filter.length > 0) {
			query.tags = { $in: user.filter };
		}
		
		const ideas = await Idea.find(query);
		callback(ideas);
	} catch (err) {
		console.error('Error getting other ideas:', err);
		throw err;
	}
}

// ============================================================================
// FILTERING & SEARCH FUNCTIONS
// ============================================================================

/**
 * Set user filter preferences
 * @param {string} email - User email
 * @param {boolean} clear - Whether to clear filters
 * @param {string} tags - Filter tags
 * @param {Function} callback - Callback function
 */
async function setFilter(email, clear, tags, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		if (clear) {
			// Clear all filters
			user.filter = [];
		} else if (tags) {
			// Set new filter tags
			user.filter = tags.split(';').filter(tag => tag.trim() !== '');
		}
		
		await user.save();
		callback(user);
	} catch (err) {
		console.error('Error setting filter:', err);
		throw err;
	}
}

/**
 * Retrieve ideas by date range
 * @param {number} posInt - Number of results to return
 * @param {Date} sdate - Start date
 * @param {Date} edate - End date
 * @param {Function} callback - Callback function
 */
async function retrieve(posInt, sdate, edate, callback) {
	try {
		const ideas = await Idea.find({
			date: {
				$gte: sdate,
				$lte: edate
			}
		}).limit(posInt);
		
		callback(ideas);
	} catch (err) {
		console.error('Error retrieving ideas:', err);
		throw err;
	}
}

// ============================================================================
// USER PREFERENCE FUNCTIONS
// ============================================================================

/**
 * Update user category preferences
 * @param {string} email - User email
 * @param {string} category - Category to add/remove
 * @param {number} flag - 1 to add, 0 to remove
 * @param {Function} callback - Callback function
 */
async function updateCategory(email, category, flag, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Initialize categoryPreference if it doesn't exist
		if (!user.categoryPreference) {
			user.categoryPreference = [];
		}
		
		if (flag === 1) {
			// Add category if not already present
			if (user.categoryPreference.indexOf(category) === -1) {
				user.categoryPreference.push(category);
			}
		} else {
			// Remove category
			const index = user.categoryPreference.indexOf(category);
			if (index > -1) {
				user.categoryPreference.splice(index, 1);
			}
		}
		
		await user.save();
		callback(user);
	} catch (err) {
		console.error('Error updating category:', err);
		throw err;
	}
}

// ============================================================================
// RATING SYSTEM FUNCTIONS
// ============================================================================

/**
 * Find user's rating for a specific idea
 * @param {string} email - User email
 * @param {string} id - Idea ID
 * @param {Function} callback - Callback function
 */
async function findRating(email, id, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Check if user has rated this idea
		const hasLiked = user.rating.likes.includes(id);
		const hasDisliked = user.rating.dislikes.includes(id);
		
		if (hasLiked) {
			callback(1); // Liked
		} else if (hasDisliked) {
			callback(-1); // Disliked
		} else {
			callback(0); // No rating
		}
	} catch (err) {
		console.error('Error finding rating:', err);
		throw err;
	}
}

/**
 * Add user rating to an idea
 * @param {string} email - User email
 * @param {number} flag - 1 for like, 0 for dislike
 * @param {string} id - Idea ID
 * @param {Function} callback - Callback function
 */
async function pushUserRating(email, flag, id, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		if (flag === 1) {
			// Add to likes
			if (user.rating.likes.indexOf(id) === -1) {
				user.rating.likes.push(id);
			}
		} else {
			// Add to dislikes
			if (user.rating.dislikes.indexOf(id) === -1) {
				user.rating.dislikes.push(id);
			}
		}
		
		await user.save();
		callback(user);
	} catch (err) {
		console.error('Error pushing user rating:', err);
		throw err;
	}
}

/**
 * Remove user rating from an idea
 * @param {string} email - User email
 * @param {number} flag - 1 for like, 0 for dislike
 * @param {string} id - Idea ID
 * @param {Function} callback - Callback function
 */
async function pullUserRating(email, flag, id, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		if (flag === 1) {
			// Remove from likes
			const index = user.rating.likes.indexOf(id);
			if (index > -1) {
				user.rating.likes.splice(index, 1);
			}
		} else {
			// Remove from dislikes
			const index = user.rating.dislikes.indexOf(id);
			if (index > -1) {
				user.rating.dislikes.splice(index, 1);
			}
		}
		
		await user.save();
		callback(user);
	} catch (err) {
		console.error('Error pulling user rating:', err);
		throw err;
	}
}

/**
 * Get all ratings for a user
 * @param {string} email - User email
 * @param {Function} callback - Callback function
 */
async function getRatings(email, callback) {
	try {
		const user = await User.findOne({ 'local.username': email });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		callback({
			likes: user.rating.likes,
			dislikes: user.rating.dislikes
		});
	} catch (err) {
		console.error('Error getting ratings:', err);
		throw err;
	}
}

// ============================================================================
// ANALYTICS & REPORTING FUNCTIONS
// ============================================================================

/**
 * Get category count statistics
 * @param {Function} callback - Callback function
 */
async function categoryCount(callback) {
	try {
		// Aggregate ideas by category
		const result = await Idea.aggregate([
			{
				$group: {
					_id: '$category',
					count: { $sum: 1 }
				}
			}
		]);
		
		// Transform result to expected format
		const categoryData = {
			health: 0,
			technology: 0,
			education: 0,
			finance: 0,
			travel: 0
		};
		
		result.forEach(item => {
			const category = item._id.toLowerCase();
			if (categoryData.hasOwnProperty(category)) {
				categoryData[category] = item.count;
			}
		});
		
		callback(categoryData);
	} catch (err) {
		console.error('Error getting category count:', err);
		throw err;
	}
}

// ============================================================================
// SAMPLE DATA GENERATION FUNCTIONS
// ============================================================================

/**
 * Create sample users with ideas for testing
 * @param {Function} callback - Callback function
 */
async function createSampleUsers(callback) {
	try {
		// Sample user data
		const sampleUsers = [
			{
				name: 'Sarah Johnson',
				email: 'sarah.johnson@example.com',
				password: '123123',
				ideas: [
					{
						title: 'AI-Powered Mental Health Assistant',
						description: 'An intelligent chatbot that provides mental health support and crisis intervention using natural language processing and machine learning.',
						category: 'Health',
						tags: ['ai', 'mental-health']
					},
					{
						title: 'Smart Home Security System',
						description: 'Advanced home security with facial recognition, motion detection, and mobile app integration for remote monitoring.',
						category: 'Technology',
						tags: ['security', 'iot']
					}
				]
			},
			{
				name: 'Michael Chen',
				email: 'michael.chen@example.com',
				password: '123123',
				ideas: [
					{
						title: 'Blockchain-Based Supply Chain Tracker',
						description: 'Transparent supply chain tracking system using blockchain technology for better accountability and traceability.',
						category: 'Technology',
						tags: ['blockchain', 'supply-chain']
					},
					{
						title: 'Personal Finance Budget Tracker',
						description: 'Intelligent budget tracking app with spending analysis, financial goal setting, and investment recommendations.',
						category: 'Finance',
						tags: ['finance', 'budget']
					}
				]
			},
			{
				name: 'Emily Rodriguez',
				email: 'emily.rodriguez@example.com',
				password: '123123',
				ideas: [
					{
						title: 'Virtual Reality Education Platform',
						description: 'Immersive educational experiences using VR technology for enhanced learning in various subjects.',
						category: 'Education',
						tags: ['vr', 'education']
					},
					{
						title: 'Eco-Friendly Transportation Solution',
						description: 'Sustainable transportation system reducing carbon footprint in urban areas with electric vehicles and smart routing.',
						category: 'Travel',
						tags: ['transportation', 'eco-friendly']
					}
				]
			}
		];

		// Remove existing sample users and their ideas
		for (const userData of sampleUsers) {
			const existingUser = await User.findOne({ 'local.username': userData.email });
			if (existingUser) {
				// Delete user's ideas
				await Idea.deleteMany({ 'author.id': existingUser._id });
				// Delete user
				await User.deleteOne({ 'local.username': userData.email });
			}
		}

		// Create new sample users
		const createdUsers = [];
		for (const userData of sampleUsers) {
			// Create new user
			const newUser = new User({
				name: userData.name,
				local: {
					username: userData.email,
					password: '' // Will be set after user creation
				},
				rating: {
					likes: [],
					dislikes: []
				}
			});

			// Hash password
			newUser.local.password = newUser.generateHash(userData.password);
			await newUser.save();
			createdUsers.push(newUser);

			// Create ideas for this user
			for (const ideaData of userData.ideas) {
				const newIdea = new Idea({
					author: {
						id: newUser._id,
						name: newUser.name,
						email: newUser.local.username
					},
					title: ideaData.title,
					normalized: ideaData.title.toLowerCase(),
					description: ideaData.description,
					tags: ideaData.tags,
					category: ideaData.category,
					rating: {
						likes: Math.floor(Math.random() * 20),
						dislikes: Math.floor(Math.random() * 5)
					}
				});
				await newIdea.save();
			}
		}

		callback({
			success: true,
			message: `Successfully created ${createdUsers.length} sample users with ${sampleUsers.reduce((total, user) => total + user.ideas.length, 0)} ideas`
		});
	} catch (err) {
		console.error('Error creating sample users:', err);
		callback({
			success: false,
			message: 'Error creating sample users: ' + err.message
		});
	}
}

/**
 * Clear all ideas for a specific user
 * @param {string} username - User email
 * @param {Function} callback - Callback function
 */
async function clearAllUserIdeas(username, callback) {
	try {
		// Find user
		const user = await User.findOne({ 'local.username': username });
		
		if (!user) {
			throw new Error('User not found');
		}
		
		// Delete all user's ideas
		const result = await Idea.deleteMany({ 'author.id': user._id });
		
		callback({
			success: true,
			message: `Successfully deleted ${result.deletedCount} ideas for user ${username}`
		});
	} catch (err) {
		console.error('Error clearing user ideas:', err);
		callback({
			success: false,
			message: 'Error clearing user ideas: ' + err.message
		});
	}
}

/**
 * Remove all ideas from the entire database
 * @param {Function} callback - Callback function
 */
async function removeAllData(callback) {
	try {
		// Delete all ideas
		const result = await Idea.deleteMany({});
		
		callback({
			success: true,
			message: `Successfully deleted ${result.deletedCount} ideas from the entire database`
		});
	} catch (err) {
		console.error('Error removing all data:', err);
		callback({
			success: false,
			message: 'Error removing all data: ' + err.message
		});
	}
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================
module.exports = {
	// Idea management
	createIdea,
	getUserIdeas,
	updateIdea,
	deleteIdea,
	getOtherIdeas,
	
	// Filtering & search
	setFilter,
	retrieve,
	
	// User preferences
	updateCategory,
	
	// Rating system
	findRating,
	pushUserRating,
	pullUserRating,
	getRatings,
	
	// Analytics
	categoryCount,
	
	// Sample data
	createSampleUsers,
	clearAllUserIdeas,
	removeAllData
};
