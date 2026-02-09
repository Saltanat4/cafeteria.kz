require('dotenv').config()
const express = require('express')
const path = require('path');
const cors =require('cors');
const app = express()
const connectDB = require('./config/db.config')

const authenticationRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminRoutes = require('./routes/adminRoutes')
const pageRoutes = require('./routes/pageRoutes')

const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/api/auth' , authenticationRoutes)
app.use('/api/user' , userRoutes)
app.use('/api/products' , productRoutes)
app.use('/api/cart' , cartRoutes)
app.use('/api/orders' , orderRoutes)
app.use('/api/admin' , adminRoutes)
app.use('/' , pageRoutes)

connectDB()

app.listen(PORT , '0.0.0.0' , () => {
	console.log(`http://localhost:${PORT}`);
})