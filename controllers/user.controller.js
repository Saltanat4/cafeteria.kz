const bcrypt = require('bcrypt')
const User = require('../models/user.model')
const { isValidEmail, isValidPassword } = require('../validators')

exports.getUser = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const user = await User.findById(req.user.id).select('-password')
		if (!user) return res.status(404).json({ message: 'User not found' })

		return res.json(user)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.updateUser = async (req, res) => {
	try {
		if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' })

		const { username, email, password } = req.body || {}

		const update = {}

		if (username !== undefined) {
		if (typeof username !== 'string' || username.trim().length < 2) {
			return res.status(400).json({ message: 'username must be at least 2 characters' })
		}
		update.username = username.trim()
		}

		if (email !== undefined) {
		if (typeof email !== 'string' || !isValidEmail(email)) {
			return res.status(400).json({ message: 'Invalid email format' })
		}

		const normalized = email.toLowerCase()

		const exists = await User.findOne({ email: normalized, _id: { $ne: req.user.id } })
		if (exists) {
			return res.status(409).json({ message: 'Email already used' })
		}

		update.email = normalized
		}

		if (password !== undefined) {
		if (!isValidPassword(password)) {
			return res.status(400).json({
			message: 'Password must be at least 8 characters and contain at least one letter'
			})
		}
		update.password = await bcrypt.hash(password, 10)
		}

		if (req.body?.role !== undefined) {
		return res.status(403).json({ message: 'You cannot change role' })
		}

		if (Object.keys(update).length === 0) {
		return res.status(400).json({ message: 'No valid fields to update' })
		}

		const user = await User.findByIdAndUpdate(
		req.user.id,
		update,
		{ new: true, runValidators: true }
		).select('-password')

		if (!user) return res.status(404).json({ message: 'User not found' })

		return res.json(user)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}
