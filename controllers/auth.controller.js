const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const { isValidEmail, isValidPassword } = require('../validators')

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
        if (!username || !email || !password) return res.status(400).json({ message: 'Fields required' })
        const exists = await User.findOne({ email })
        if (exists) return res.status(409).json({ message: 'Email used' })
        const hashed = await bcrypt.hash(password, 10)
        await User.create({ username, email, password: hashed })
        res.status(201).json({ message: 'User created' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = signToken(user)
        res.json({ token, user: { id: user._id, username: user.username, role: user.role } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};