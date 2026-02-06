const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
	order: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
		required: true
	},

	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},

	product_name: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true,
		min: 1
	},

	unit_price: {
		type: Number,
		required: true
	},

	subtotal: {
		type: Number,
		required: true
	}
})

module.exports = mongoose.model('OrderItem', orderItemSchema , 'orderItems')
