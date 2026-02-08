const express = require('express')
const router = express.Router()
const controller = require('../controllers/order.controller')
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

router.get('/list' , auth , controller.getAllOrders)
router.get('/:id/items' , auth , controller.getOrderItems)
router.get('/:id' , auth , controller.getOrderByID)
router.post('/' , auth , controller.createOrder)
router.put('/:id' , auth , isAdmin , controller.updateOrder)


module.exports = router