const express = require('express')
const router = express.Router()
const controller = require('../controllers/product.controller')

router.get('/' , controller.getAllProducts)
router.get('/:id' , controller.getProductByID)
router.post('/' , controller.createProduct)
router.put('/:id' , controller.updateProduct)
router.delete('/:id' , controller.deleteProduct)

module.exports = router