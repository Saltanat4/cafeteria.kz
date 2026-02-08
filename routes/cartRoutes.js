const router = require('express').Router()
const controller = require('../controllers/cart.controller')
const auth = require('../middlewares/auth')

router.get('/list', auth, controller.getAllItems)
router.post('/', auth, controller.addItem)
router.put('/:id', auth, controller.updateItemQuantity)
router.delete('/:id', auth, controller.removeItem)
router.delete('/', auth, controller.clearCart)

module.exports = router
