require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path');

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.get('/' , (req , res) => {
	res.sendFile(path.join(__dirname , 'views' , 'index.html'));
})

app.listen(PORT , () => {
	console.log(`http://localhost:${PORT}`);
})