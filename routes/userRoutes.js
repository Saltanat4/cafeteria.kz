const router = require('express').Router()
const controller = require('../controllers/user.controller')
const auth = require('../middlewares/auth')

router.get('/me', auth, controller.getUser)
router.put('/me', auth, controller.updateUser)

module.exports = router
