const Order = require('../models/order.model')
const OrderItem = require('../models/orderItem.model')
const Product = require('../models/product.model')
const CartItem = require('../models/cartItem.model')
const mongoose = require('mongoose')

exports.getAllOrders = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const filter = { user: req.user.id }

		const orders = await Order.find(filter).sort({ createdAt: -1 })

		return res.json(orders)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.getOrderByID = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid order id' })
		}

		const order = await Order.findById(id)
		if (!order) return res.status(404).json({ message: 'Order not found' })

		const isOwner = order.user.toString() === req.user.id
		const isAdmin = req.user.role === 'admin'
		if (!isOwner && !isAdmin) {
		return res.status(403).json({ message: 'Forbidden' })
		}

		return res.json(order)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}


exports.createOrder = async (req, res) => {
	try {
		if (!req.user?.id) {
		return res.status(401).json({ message: 'Unauthorized' })
		}

		const { order_type, delivery_address, notes } = req.body || {}

		if (!order_type) {
		return res.status(400).json({ message: 'order_type required' })
		}

		if (!['pickup', 'delivery'].includes(order_type)) {
		return res.status(400).json({ message: 'Invalid order_type' })
		}

		if (order_type === 'delivery' && !delivery_address) {
		return res.status(400).json({ message: 'delivery_address required for delivery' })
		}

		// 1. Берём корзину пользователя
		const cartItems = await CartItem
		.find({ user: req.user.id })
		.populate('product')

		if (!cartItems.length) {
		return res.status(400).json({ message: 'Cart is empty' })
		}

		// 2. Формируем orderItems
		const orderItemsDocs = cartItems.map(ci => {
		const quantity = Number(ci.quantity)
		const unit_price = Number(ci.product.price)

		return {
			product: ci.product._id,
			product_name: ci.product.name,
			quantity,
			unit_price,
			subtotal: quantity * unit_price
		}
		})

		const total_amount = orderItemsDocs.reduce((sum, it) => sum + it.subtotal, 0)

		// 3. Создаём заказ
		const order = await Order.create({
		user: req.user.id,
		status: 'pending',
		total_amount,
		order_type,
		delivery_address: order_type === 'delivery' ? delivery_address : '',
		notes: notes || ''
		})

		// 4. Сохраняем orderItems
		const orderItemsWithOrder = orderItemsDocs.map(d => ({
		...d,
		order: order._id
		}))

		const createdItems = await OrderItem.insertMany(orderItemsWithOrder)

		// 5. Чистим корзину
		await CartItem.deleteMany({ user: req.user.id })

		return res.status(201).json({
		message: 'Order created',
		order,
		items: createdItems
		})

	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
}

exports.updateOrder = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid order id' })
		}

		const order = await Order.findById(id)
		if (!order) return res.status(404).json({ message: 'Order not found' })

		if (order.user.toString() !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' })
		}

		const lockedStatuses = ['ready', 'completed', 'cancelled']
		if (lockedStatuses.includes(order.status)) {
		return res.status(400).json({
			message: `Order is locked. You cannot update it when status is '${order.status}'`
		})
		}

		const update = {}

		if (req.body.notes !== undefined) {
		update.notes = req.body.notes
		}

		if (req.body.delivery_address !== undefined) {
		if (order.order_type !== 'delivery') {
			return res.status(400).json({ message: 'delivery_address only for delivery orders' })
		}
		update.delivery_address = req.body.delivery_address
		}

		// статус юзер может поставить ТОЛЬКО cancelled
		if (req.body.status !== undefined) {
		if (req.body.status !== 'cancelled') {
			return res.status(403).json({ message: 'User can only set status to cancelled' })
		}
		update.status = 'cancelled'
		}

		// если вообще ничего не прислали
		if (Object.keys(update).length === 0) {
		return res.status(400).json({ message: 'No valid fields to update' })
		}

		const updated = await Order.findByIdAndUpdate(id, update, {
		new: true,
		runValidators: true
		})

		return res.json(updated)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}


exports.getOrderItems = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid order id' })
		}

		const order = await Order.findById(id)
		if (!order) return res.status(404).json({ message: 'Order not found' })

		const isOwner = order.user.toString() === req.user.id
		const isAdmin = req.user.role === 'admin'
		if (!isOwner && !isAdmin) {
		return res.status(403).json({ message: 'Forbidden' })
		}

		const items = await OrderItem
		.find({ order: id })
		.populate('product') 

		return res.json(items)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}
