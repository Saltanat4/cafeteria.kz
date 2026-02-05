require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path');
const app = express()

const authenticationRoutes = require('./routes/authenticationRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminRoutes = require('./routes/adminRoutes')


const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.use('/auth' , authenticationRoutes)
app.use('/user' , userRoutes)
app.use('/products' , productRoutes)
app.use('/cart' , cartRoutes)
app.use('/orders' , orderRoutes)
app.use('/admin' , adminRoutes)

app.get('/' , (req , res) => {
	res.sendFile(path.join(__dirname , 'views' , 'index.html'));
})

app.listen(PORT , () => {
	console.log(`http://localhost:${PORT}`);
})