const Order = require('../models/order.model')
const OrderItem = require('../models/orderItem.model')
const Product = require('../models/product.model')
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
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { order_type, delivery_address, notes, items } = req.body || {}

		if (!order_type) return res.status(400).json({ message: 'order_type required' })
		if (!['pickup', 'delivery'].includes(order_type)) {
		return res.status(400).json({ message: 'Invalid order_type' })
		}
		if (order_type === 'delivery' && !delivery_address) {
		return res.status(400).json({ message: 'delivery_address required for delivery' })
		}

		if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ message: 'items array required' })
		}

		const productIds = []
		for (const it of items) {
		if (!it.product || !mongoose.Types.ObjectId.isValid(it.product)) {
			return res.status(400).json({ message: 'Invalid product id in items' })
		}
		const q = Number(it.quantity)
		if (!Number.isFinite(q) || q < 1) {
			return res.status(400).json({ message: 'quantity must be >= 1' })
		}
		productIds.push(it.product)
		}

		const products = await Product.find({ _id: { $in: productIds } })

		const productMap = new Map(products.map(p => [p._id.toString(), p]))

		for (const pid of productIds) {
		if (!productMap.has(pid.toString())) {
			return res.status(400).json({ message: `Product not found: ${pid}` })
		}
		}

		const order = await Order.create({
		user: req.user.id,
		status: 'pending',
		total_amount: 0,
		order_type,
		delivery_address: order_type === 'delivery' ? delivery_address : '',
		notes: notes || ''
		})

		const orderItemsDocs = items.map((it) => {
		const p = productMap.get(it.product.toString())
		const quantity = Number(it.quantity)
		const unit_price = Number(p.price)
		const subtotal = quantity * unit_price

		return {
			order: order._id,
			product: p._id,
			product_name: p.name,
			quantity,
			unit_price,
			subtotal
		}
		})

		const createdItems = await OrderItem.insertMany(orderItemsDocs)

		const total_amount = createdItems.reduce((sum, i) => sum + i.subtotal, 0)
		order.total_amount = total_amount
		await order.save()

		return res.status(201).json({
		message: 'Order created',
		order,
		items: createdItems
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
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
