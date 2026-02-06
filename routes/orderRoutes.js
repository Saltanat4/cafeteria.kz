const express = require('express')
const router = express.Router()
const controller = require('../controllers/order.controller')

router.get('/' , controller.getAllOrders)
router.get('/:id' , controller.getOrderByID)
router.post('/' , controller.createOrder)
router.put('/:id' , controller.updateOrder)
router.get('/:id/items' , controller.getOrderItems)


module.exports = router