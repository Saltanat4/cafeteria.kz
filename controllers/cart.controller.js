const mongoose = require("mongoose");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getAllItems = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const items = await CartItem.find({ user: userId })
		.populate("product")
		.sort({ createdAt: -1 });

	res.json(items);
});

exports.addItem = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const { product, quantity } = req.body || {};

	if (!product || !mongoose.Types.ObjectId.isValid(product)) {
		res.status(400);
		throw new Error("Invalid product id");
	}

	const qty = Number(quantity ?? 1);
	if (!Number.isFinite(qty) || qty < 1) {
		res.status(400);
		throw new Error("quantity must be >= 1");
	}

	const p = await Product.findById(product);
	if (!p) {
		res.status(404);
		throw new Error("Product not found");
	}

	if (p.is_available === false) {
		res.status(400);
		throw new Error("Product is not available");
	}

	const existing = await CartItem.findOne({ user: userId, product });

	if (existing) {
		existing.quantity += qty;
		await existing.save();

		const updated = await CartItem.findById(existing._id).populate("product");
		return res.status(200).json({
		message: "Cart item quantity increased",
		item: updated,
		});
	}

	const item = await CartItem.create({
		user: userId,
		product,
		quantity: qty,
	});

	const full = await CartItem.findById(item._id).populate("product");
	res.status(201).json({
		message: "Item added to cart",
		item: full,
	});
	});

	exports.updateItemQuantity = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid cart item id");
	}

	const qty = Number(req.body?.quantity);
	if (!Number.isFinite(qty) || qty < 1) {
		res.status(400);
		throw new Error("quantity must be >= 1");
	}

	const updated = await CartItem.findOneAndUpdate(
		{ _id: id, user: userId },
		{ quantity: qty },
		{ new: true, runValidators: true }
	).populate("product");

	if (!updated) {
		res.status(404);
		throw new Error("Cart item not found");
	}

	res.json({
		message: "Cart item updated",
		item: updated,
	});
});

exports.removeItem = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid cart item id");
	}

	const deleted = await CartItem.findOneAndDelete({ _id: id, user: userId });
	if (!deleted) {
		res.status(404);
		throw new Error("Cart item not found");
	}

	res.json({ message: "Item removed from cart" });
});

exports.clearCart = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	await CartItem.deleteMany({ user: userId });

	res.json({ message: "Cart cleared" });
});
