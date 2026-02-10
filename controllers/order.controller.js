const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const CartItem = require("../models/cartItem.model");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getAllOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

    const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id }).populate("product");
        return { ...order, items };
        })
    );

    res.json(ordersWithItems);
});

exports.getOrderByID = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid order id");
    }

    const order = await Order.findById(id);
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.user.toString() !== userId.toString()) {
        res.status(403);
        throw new Error("Forbidden");
    }

    res.json(order);
    });

    exports.getOrderItems = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid order id");
    }

    const order = await Order.findById(id).select("user");
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.user.toString() !== userId.toString()) {
        res.status(403);
        throw new Error("Forbidden");
    }

    const items = await OrderItem.find({ order: id }).populate("product");
    res.json(items);
});

exports.createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { order_type, delivery_address, notes } = req.body;

        const cartItems = await CartItem.find({ user: userId })
        .populate("product")
        .session(session);

        if (!cartItems || cartItems.length === 0) {
        res.status(400);
        throw new Error("Cart is Empty");
        }

        let totalAmount = 0;

        const newOrder = new Order({
        user: userId,
        total_amount: 0,
        order_type,
        delivery_address,
        notes,
        status: "pending",
        });

        await newOrder.save({ session });

        for (const item of cartItems) {
        if (!item.product) continue;

        const subtotal = item.product.price * item.quantity;
        totalAmount += subtotal;

        await OrderItem.create(
            [
            {
                order: newOrder._id,
                product: item.product._id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal,
            },
            ],
            { session }
        );
        }

        newOrder.total_amount = totalAmount;
        await newOrder.save({ session });

        await CartItem.deleteMany({ user: userId }).session(session);

        await session.commitTransaction();
        res.status(201).json(newOrder);
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
});

exports.updateOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid order id");
    }

    const order = await Order.findById(id);
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.user.toString() !== userId.toString()) {
        res.status(403);
        throw new Error("Forbidden");
    }

    const update = {};

    if (req.body.notes !== undefined) update.notes = req.body.notes;

    if (req.body.status === "cancelled") {
        const notCancellable = ["completed", "cancelled"];
        if (notCancellable.includes(order.status)) {
        res.status(400);
        throw new Error("Order cannot be cancelled");
        }
        update.status = "cancelled";
    }

    if (Object.keys(update).length === 0) {
        res.status(400);
        throw new Error("No valid fields to update");
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });
    res.json(updated);
});
