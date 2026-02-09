const express = require('express')
const router = express.Router()
const controller = require('../controllers/admin.controller')
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

router.use(auth , isAdmin);

router.get('/orders' , controller.getAllOrders)
router.get('/users', controller.getAllUsers)
router.put('/orders/:id/status' , controller.updateOrder)

module.exports = router