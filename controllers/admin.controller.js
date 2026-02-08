const mongoose = require('mongoose')
const Order = require('../models/order.model')
const User = require('../models/user.model')

exports.getAllOrders = async (req, res) => {
	try {
		const { status } = req.query
		const filter = {}

		if (status) filter.status = status

		const orders = await Order.find(filter)
		.populate('user', 'username email role') 
		.sort({ createdAt: -1 })

		return res.json(orders)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.updateOrder = async (req, res) => {
	try {
		const { id } = req.params
		const { status } = req.body || {}

		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid order id' })
		}

		const allowedStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']
		if (!status || !allowedStatuses.includes(status)) {
		return res.status(400).json({ message: 'Invalid status' })
		}

		const updated = await Order.findByIdAndUpdate(
		id,
		{ status },
		{ new: true, runValidators: true }
		).populate('user', 'username email role')

		if (!updated) {
		return res.status(404).json({ message: 'Order not found' })
		}

		return res.json({
		message: 'Order status updated',
		order: updated
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find({})
		.select('-password') 
		.sort({ createdAt: -1 })

		return res.json(users)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}
