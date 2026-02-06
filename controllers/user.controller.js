const User = require('../models/user.model')

exports.getUser = async (req , res) => {
	try {
		// 1) input
		// 2) validate
		// 3) db
		// 4) response
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
}

exports.updateUser = async (req , res) => {
	try {
		const {username , email , password ,role} = req.body;
		
		// 2) validate
		// 3) db
		// 4) response

		res.status(200).json({username , email , password , role})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	}
}
