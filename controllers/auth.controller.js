const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const signToken = (user) => {
	return jwt.sign(
		{ id: user._id.toString(), role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
	)
}

exports.register = async (req, res) => {
	try {
		const { username, email, password } = req.body

		if (!username || !email || !password) {
		return res.status(400).json({ message: 'username, email, password required' })
		}

		if (!isValidEmail(email)) {
			return res.status(400).json({
				message: 'Invalid email format'
			})
		}

		if (!isValidPassword(password)) {
			return res.status(400).json({
				message: 'Password must be at least 8 characters and contain at least one letter'
			})
		}

		const exists = await User.findOne({ email })
		if (exists) {
		return res.status(409).json({ message: 'Email already used' })
		}

		const hashed = await bcrypt.hash(password, 10)

		const user = await User.create({
			username,
			email,
			password: hashed,
			role: 'user'
		})

		const token = signToken(user)

		return res.status(201).json({
		token,
		user: {
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role
		}
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
		return res.status(400).json({ message: 'email, password required' })
		}

		if (!isValidEmail(email)) {
			return res.status(400).json({
				message: 'Invalid email format'
			})
		}

		if (!isValidPassword(password)) {
			return res.status(400).json({
				message: 'Password must be at least 8 characters and contain at least one letter'
			})
		}
		
		const user = await User.findOne({ email })
		if (!user) {
		return res.status(401).json({ message: 'Invalid credentials' })
		}

		const ok = await bcrypt.compare(password, user.password)
		if (!ok) {
		return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = signToken(user)

		return res.json({
		token,
		user: {
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role
		}
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.getInfo = async (req, res) => {
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


const isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

const isValidPassword = (password) => {
	if (typeof password !== 'string') return false;
	if (password.length < 8) return false;
	if (/[a-zA-Z]/.test(password)) return false;

	return true
}