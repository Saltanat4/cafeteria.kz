const express = require('express')
const router = express.Router()
const controller = require('../controllers/product.controller')
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin')

router.get('/' , controller.getAllProducts)
router.get('/:id' , controller.getProductByID)
router.post('/', auth , isAdmin , controller.createProduct)
router.put('/:id', auth , isAdmin , controller.updateProduct)
router.delete('/:id', auth , isAdmin , controller.deleteProduct)

module.exports = router