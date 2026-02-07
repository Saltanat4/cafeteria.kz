const express = require('express')
const router = express.Router()
const path = require('path');


router.get('/' , (req , res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
})

router.get('/admin' , (req , res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
})

router.get('/orders' , (req , res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'orders.html'));
})

router.get('/cart' , (req , res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'cart.html'));
})

router.get('/auth' , (req , res) => {
	res.sendFile(path.join(__dirname, '..', 'views', 'auth.html'));
})



module.exports = router