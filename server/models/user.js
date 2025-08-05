var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var date = new Date();
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var year = date.getFullYear();
var month = date.getMonth();
var day = date.getDate();
var parsedDate = months[month] + ' ' + day + ', ' + year;

var userSchema = new mongoose.Schema({

	name: {
		type: String,
		default: 'Techie'

	},
	local: {
		username: {
			type: String,
			unique: true

		},
		password: {
			type: String,
		}
	},
	date: {
		type: Date,
		default: date
	},
	parsedDate: {
		type: String,
		default: parsedDate
	},
	rating: {
		likes: {
			type: [String],
			default: []
		},
		dislikes: {
			type: [String],
			default: []
		}
	},
	categoryPreference: {
		type: Array,
		default: ["Health", "Technology", "Education", "Finance", "Travel"]
	},
	sortingPreference: {
		order: {
			type: Number,
			default: 1
		},
		sortBy: {
			type: String,
			default: 'date'
		}
	},
	filter: {
		type: Array,
		default: []
	},
	department: {
		type: String,
		default: 'Geek'
	},

	facebook: String,
	google: String,
	tokens: Array,
	email: String,

	profile: {
		name: {
			type: String,
			default: ''
		},
		gender: {
			type: String,
			default: ''
		},
		location: {
			type: String,
			default: ''
		},
		website: {
			type: String,
			default: ''
		},
		picture: {
			type: String,
			default: ''
		}
	},

	resetPasswordToken: String,
	resetPasswordExpires: Date

}, {
	versionKey: false
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);
