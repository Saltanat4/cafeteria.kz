const express = require('express')
const router = express.Router()
const controller = require('../controllers/admin.controller')
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

router.get('/orders' , auth , isAdmin , controller.getAllOrders)
router.get('/users', auth , isAdmin , controller.getAllUsers)
router.put('/orders/:id/status' , auth , isAdmin , controller.updateOrder)


module.exports = router