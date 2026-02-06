const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
	{
		name: {
		type: String,
		required: true
		},

		description: {
		type: String
		},

		price: {
		type: Number,
		required: true,
		min: 0
		},

		category: {
		type: String,
		enum: ['espresso', 'latte', 'cappuccino', 'pastry'],
		required: true
		},

		image_url: {
		type: String
		},

		is_available: {
		type: Boolean,
		default: true
		}
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
