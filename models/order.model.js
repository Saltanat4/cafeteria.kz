const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
	{
		user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
		},

		status: {
		type: String,
		enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
		default: 'pending'
		},

		total_amount: {
		type: Number,
		required: true
		},

		order_type: {
		type: String,
		enum: ['pickup', 'delivery'],
		required: true
		},

		delivery_address: {
		type: String
		},

		notes: {
		type: String
		}
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
