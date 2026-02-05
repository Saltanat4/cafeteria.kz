const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')

router.post('/register' , controller.register)
router.post('/login' , controller.login)
router.post('/logout' , controller.logout)
router.get('/me' , controller.getInfo)

module.exports = router