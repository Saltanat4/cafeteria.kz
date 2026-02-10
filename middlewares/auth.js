const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

async function protect(req, res, next) {
	try {
		const header = req.headers.authorization;

		if (!header || !header.startsWith("Bearer ")) {
		res.status(401);
		throw new Error("Not authorized: no token");
		}

		const token = header.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id).select("-password");
		if (!user) {
		res.status(401);
		throw new Error("Not authorized: user not found");
		}

		req.user = user;
		next();
	} catch (err) {
		res.status(401);
		next(err);
	}
}

module.exports = { protect };
