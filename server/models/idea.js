var mongoose = require('mongoose');

var date = new Date();
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var year = date.getFullYear();
var month = date.getMonth();
var day = date.getDate();
var parsedDate = months[month] + ' ' + day + ', ' + year;

var ideaSchema = new mongoose.Schema({
	author: {
		id: String,
		name: String,
		email: String
	},
	title: {
		type: String,
		required: true
	},
	normalized: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	category: {
		type: String,
		required: true
	},
	tags: [String],
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
			type: Number,
			default: 0
		},
		dislikes: {
			type: Number,
			default: 0
		}
	}
}, {
	versionKey: false
});

module.exports = mongoose.model('Ideas', ideaSchema);