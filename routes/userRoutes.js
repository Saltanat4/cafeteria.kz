const express = require('express')
const router = express.Router()
const controller = require('../controllers/userController')

router.get('/profile' , controller.getUser)
router.post('/profile' , controller.updateUser)

module.exports = router