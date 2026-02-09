const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart.controller');
const auth = require('../middlewares/auth');
const isUser = require('../middlewares/isUser');

router.use(auth , isUser);

router.get('/', controller.getAllItems);
router.post('/', controller.addItem);
router.put('/:id', controller.updateItemQuantity);
router.delete('/:id', controller.removeItem);
router.delete('/', controller.clearCart);

module.exports = router