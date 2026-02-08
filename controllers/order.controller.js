const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const CartItem = require('../models/cartItem.model');

// Создание заказа (POST /orders/)
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        // Берем данные из тела запроса (фронтенд пришлет order_type и notes)
        const { order_type, delivery_address, notes } = req.body;

        // 1. Получаем корзину пользователя, чтобы посчитать сумму и забрать товары
        const cartItems = await CartItem.find({ user: userId }).populate('product');

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cannot place order: Cart is empty" });
        }

        // 2. Считаем общую сумму заказа
        const totalAmount = cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        // 3. Создаем основной заказ (Order)
        const newOrder = new Order({
            user: userId,
            total_amount: totalAmount,
            order_type: order_type || 'pickup',
            delivery_address: delivery_address || '',
            notes: notes || '',
            status: 'pending' // значение по умолчанию из схемы
        });

        const savedOrder = await newOrder.save();

        // 4. Сохраняем каждый товар из корзины в коллекцию orderItems
        // Это важно, чтобы история заказа сохранилась, даже если товар удалят из меню
        const orderItemsData = cartItems.map(item => ({
            order: savedOrder._id,
            product: item.product._id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            subtotal: item.product.price * item.quantity
        }));

        await OrderItem.insertMany(orderItemsData);

        // 5. Очищаем корзину пользователя
        await CartItem.deleteMany({ user: userId });

        res.status(201).json({
            message: "Order placed successfully!",
            order: savedOrder
        });

    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Получить все заказы текущего пользователя
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Получить конкретный заказ
exports.getOrderByID = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Обновить заказ (например, отменить)
exports.updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Получить детали (товары) конкретного заказа
exports.getOrderItems = async (req, res) => {
    try {
        const items = await OrderItem.find({ order: req.params.id }).populate('product');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};