const mongoose = require("mongoose");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getAllOrders = asyncHandler(async (req, res) => {
	const { status } = req.query;
	const filter = {};

	if (status) filter.status = status;

	const orders = await Order.find(filter)
		.populate("user", "username email role")
		.sort({ createdAt: -1 });

	res.json(orders);
});

exports.updateOrder = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { status } = req.body || {};

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid order id");
	}

	const allowedStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
	if (!status || !allowedStatuses.includes(status)) {
		res.status(400);
		throw new Error("Invalid status");
	}

	const order = await Order.findById(id).select("status");
	if (!order) {
		res.status(404);
		throw new Error("Order not found");
	}

	if (order.status === "cancelled") {
		res.status(400);
		throw new Error("Cancelled order cannot be updated");
	}

	if (order.status === "completed") {
		res.status(400);
		throw new Error("Completed order cannot be updated");
	}

	if (order.status === status) {
		return res.status(200).json({ message: "No changes", order });
	}

	const updated = await Order.findByIdAndUpdate(
		id,
		{ status },
		{ new: true, runValidators: true }
	).populate("user", "username email role");

	res.json({ message: "Order status updated", order: updated });
	});

	exports.getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find({})
		.select("-password")
		.sort({ createdAt: -1 });

	res.json(users);
});
