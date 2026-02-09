const express = require('express')
const router = express.Router()
const controller = require('../controllers/order.controller')
const auth = require('../middlewares/auth')
const isUser = require('../middlewares/isUser');

router.use(auth , isUser);

router.get('/' , controller.getAllOrders)
router.get('/:id/items' , controller.getOrderItems)
router.get('/:id' , controller.getOrderByID)
router.post('/' , controller.createOrder)
router.put('/:id' , controller.updateOrder)

module.exports = router