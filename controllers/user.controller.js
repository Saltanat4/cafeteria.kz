const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getUser = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const user = await User.findById(userId).select("-password");
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	res.json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	if (req.body.role !== undefined) {
		res.status(403);
		throw new Error("You cannot change role");
	}

	const update = { ...req.body };

	if (update.password) {
		update.password = await bcrypt.hash(update.password, 10);
	}

	const user = await User.findByIdAndUpdate(userId, update, {
		new: true,
		runValidators: true,
	}).select("-password");

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	res.json(user);
});
