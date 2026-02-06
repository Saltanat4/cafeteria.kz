const express = require('express')
const router = express.Router()
const controller = require('../controllers/user.controller')

router.get('/' , controller.getUser)
router.post('/' , controller.updateUser)

module.exports = router