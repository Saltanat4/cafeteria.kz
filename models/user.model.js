const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		username: {
		type: String,
		required: true,
		trim: true
		},

		email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		},

		password: {
		type: String,
		required: true,
		minlength: 8
		},

		role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
		}
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
