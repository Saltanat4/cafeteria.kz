const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Product = require('../models/product.model');
const CartItem = require('../models/cartItem.model');
const mongoose = require('mongoose');

exports.getAllOrders = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

        // Чтобы на фронтенде сразу были видны товары, добавим их к заказам
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.find({ order: order._id }).populate('product');
            return { ...order, items };
        }));

        return res.json(ordersWithItems);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getOrderByID = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const isOwner = order.user.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { order_type, delivery_address, notes } = req.body;
        
        // Теперь CartItem определен!
        const cartItems = await CartItem.find({ user: req.user.id }).populate('product').session(session);

        if (!cartItems || cartItems.length === 0) {
            throw new Error('Ваша корзина пуста');
        }

        let totalAmount = 0;
        const newOrder = new Order({
            user: req.user.id,
            total_amount: 0, 
            order_type,
            delivery_address,
            notes,
            status: 'pending'
        });

        await newOrder.save({ session });

        for (const item of cartItems) {
            if (!item.product) continue;
            
            const subtotal = item.product.price * item.quantity;
            totalAmount += subtotal;

            await OrderItem.create([{
                order: newOrder._id,
                product: item.product._id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: subtotal
            }], { session });
        }

        newOrder.total_amount = totalAmount;
        await newOrder.save({ session });

        // Очищаем корзину после успешного создания заказа
        await CartItem.deleteMany({ user: req.user.id }).session(session);

        await session.commitTransaction();
        res.status(201).json(newOrder);
    } catch (error) {
        await session.abortTransaction();
        console.error("Order Creation Error:", error);
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        const update = {};
        if (req.body.notes) update.notes = req.body.notes;
        if (req.body.status === 'cancelled') update.status = 'cancelled';

        const updated = await Order.findByIdAndUpdate(id, update, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await OrderItem.find({ order: id }).populate('product');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};