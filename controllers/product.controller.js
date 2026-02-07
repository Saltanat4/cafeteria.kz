	const Product = require('../models/product.model')
	const mongoose = require('mongoose')

	exports.getAllProducts = async (req, res) => {
	try {
		const { category, available } = req.query

		const filter = {}

		if (category) {
		filter.category = category
		}

		if (available !== undefined) {
		filter.is_available = available === 'true'
		}

		const products = await Product.find(filter).sort({ createdAt: -1 })

		res.json(products)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
	}

	exports.getProductByID = async (req, res) => {
	try {
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid product id' })
		}

		const product = await Product.findById(id)
		if (!product) {
		return res.status(404).json({ message: 'Product not found' })
		}

		res.json(product)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
	}

	exports.createProduct = async (req, res) => {
	try {
		const { name, price, category } = req.body

		if (!name || price == null || !category) {
		return res.status(400).json({
			message: 'name, price, category required'
		})
		}

		const product = await Product.create({
		name,
		description: req.body.description || '',
		price,
		category,
		image_url: req.body.image_url || '',
		is_available: req.body.is_available ?? true
		})

		res.status(201).json(product)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
	}

	exports.updateProduct = async (req, res) => {
	try {
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid product id' })
		}

		const updated = await Product.findByIdAndUpdate(
		id,
		req.body,
		{
			new: true,
			runValidators: true
		}
		)

		if (!updated) {
		return res.status(404).json({ message: 'Product not found' })
		}

		res.json(updated)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
	}

	exports.deleteProduct = async (req, res) => {
	try {
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: 'Invalid product id' })
		}

		const deleted = await Product.findByIdAndDelete(id)

		if (!deleted) {
		return res.status(404).json({ message: 'Product not found' })
		}

		res.json({ message: 'Product deleted' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
	}
