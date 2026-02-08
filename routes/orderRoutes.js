const express = require('express')
const router = express.Router()
const controller = require('../controllers/order.controller')
const auth = require('../middlewares/auth');

router.get('/list' , auth, controller.getAllOrders)
router.get('/:id' , auth, controller.getOrderByID)
router.post('/' , auth, controller.createOrder)
router.put('/:id' , auth, controller.updateOrder)
router.get('/:id/items' , auth, controller.getOrderItems)


module.exports = router