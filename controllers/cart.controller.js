const CartItem = require('../models/cartItem.model')

exports.getAllItems = async (req, res) => {
    try {
        const items = await CartItem.find({ user: req.user.id }).populate('product');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id; 

        let cartItem = await CartItem.findOne({ user: userId, product: productId });

        if (cartItem) {
            cartItem.quantity += (quantity || 1);
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                user: userId,
                product: productId,
                quantity: quantity || 1
            });
        }

        res.status(201).json({ message: "Added successfully!", cartItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add to cart" });
    }
};

exports.updateItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cartItem = await CartItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, // Ищем по ID записи и ID юзера для безопасности
            { quantity: quantity },
            { new: true }
        );

        if (!cartItem) return res.status(404).json({ message: "Item not found" });
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Удалить один товар (DELETE /cart/:id)
exports.removeItem = async (req, res) => {
    try {
        const cartItem = await CartItem.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!cartItem) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Очистить всю корзину пользователя (DELETE /cart/)
exports.clearCart = async (req, res) => {
    try {
        await CartItem.deleteMany({ user: req.user.id });
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};