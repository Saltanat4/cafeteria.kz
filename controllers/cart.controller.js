const CartItem = require('../models/cartItem.model')
const Product = require('../models/product.model')
const mongoose = require('mongoose')

exports.getAllItems = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const items = await CartItem.find({ user: req.user.id })
		.populate('product') 
		.sort({ createdAt: -1 })

		return res.json(items)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.addItem = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { product, quantity } = req.body || {}

		if (!product || !mongoose.Types.ObjectId.isValid(product)) {
		return res.status(400).json({ message: 'Invalid product id' })
		}

		const qty = Number(quantity ?? 1)
		if (!Number.isFinite(qty) || qty < 1) {
		return res.status(400).json({ message: 'quantity must be >= 1' })
		}

		const p = await Product.findById(product)
		if (!p) return res.status(404).json({ message: 'Product not found' })
		if (p.is_available === false) {
		return res.status(400).json({ message: 'Product is not available' })
		}

		const existing = await CartItem.findOne({ user: req.user.id, product })
		if (existing) {
		existing.quantity += qty
		await existing.save()

		const updated = await CartItem.findById(existing._id).populate('product')
		return res.status(200).json({
			message: 'Cart item quantity increased',
			item: updated
		})
		}

		const item = await CartItem.create({
		user: req.user.id,
		product,
		quantity: qty
		})

		const full = await CartItem.findById(item._id).populate('product')
		return res.status(201).json({
		message: 'Item added to cart',
		item: full
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.updateItemQuantity = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid cart item id' })
		}

		const qty = Number(req.body?.quantity)
		if (!Number.isFinite(qty) || qty < 1) {
		return res.status(400).json({ message: 'quantity must be >= 1' })
		}

		const updated = await CartItem.findOneAndUpdate(
		{ _id: id, user: req.user.id },
		{ quantity: qty },
		{ new: true, runValidators: true }
		).populate('product')

		if (!updated) return res.status(404).json({ message: 'Cart item not found' })

		return res.json({
		message: 'Cart item updated',
		item: updated
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.removeItem = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid cart item id' })
		}

		const deleted = await CartItem.findOneAndDelete({ _id: id, user: req.user.id })
		if (!deleted) return res.status(404).json({ message: 'Cart item not found' })

		return res.json({ message: 'Item removed from cart' })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.clearCart = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		await CartItem.deleteMany({ user: req.user.id })
		return res.json({ message: 'Cart cleared' })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}
