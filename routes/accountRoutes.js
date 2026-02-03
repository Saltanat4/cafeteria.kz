const express = require('express')
const router = express.Router()
const controller = require('../controllers/accountController')

router.post('/register' , controller.register)
router.post('/login' , controller.login)
router.delete('/delete' , controller.delete)

module.exports = router