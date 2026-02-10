const mongoose = require("mongoose");
const Product = require("../models/product.model");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getAllProducts = asyncHandler(async (req, res) => {
	const { category, available } = req.query;
	const filter = {};

	if (category) filter.category = category;

	if (available !== undefined) {
		filter.is_available = available === "true";
	}

	const products = await Product.find(filter).sort({ createdAt: -1 });
	res.json(products);
});

exports.getProductByID = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid product id");
	}

	const product = await Product.findById(id);
	if (!product) {
		res.status(404);
		throw new Error("Product not found");
	}

	res.json(product);
});

exports.createProduct = asyncHandler(async (req, res) => {
	const { name, price, category } = req.body;

	if (!name || price == null || !category) {
		res.status(400);
		throw new Error("name, price, category required");
	}

	const product = await Product.create({
		name,
		description: req.body.description || "",
		price,
		category,
		image_url: req.body.image_url || "",
		is_available: req.body.is_available ?? true,
	});

	res.status(201).json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid product id");
	}

	const updated = await Product.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updated) {
		res.status(404);
		throw new Error("Product not found");
	}

	res.json(updated);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400);
		throw new Error("Invalid product id");
	}

	const deleted = await Product.findByIdAndDelete(id);

	if (!deleted) {
		res.status(404);
		throw new Error("Product not found");
	}

	res.json({ message: "Product deleted" });
});
