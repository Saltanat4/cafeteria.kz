require('dotenv').config(); 
const mongoose = require('mongoose');
const Product = require('./models/product.model'); 
const MONGO_URI = process.env.MONGO_URI; 

const products = [
    { 
        name: "Affogato", 
        price: 1550, 
        description:"A simple Italian dessert of hot espresso poured over cold vanilla ice cream",
        category: "cappuccino", 
        image_url: "images/affogatto.jpg" 
    },
    {
        name: "Cappuccino",
        price: 1150,
        description:"A balanced coffee with rich espresso, steamed milk, and a thick, airy foam on top",
        category: "cappuccino",
        image_url: "images/cappuccino.jpg"
    },
    {
        name: "Flat White",
        price: 1350,
        description:"A smooth and velvety coffee with a higher espresso-to-milk ratio and silky microfoam",
        category: "cappuccino",
        image_url: "images/flatwhite.jpg"
    },
    {
        name: "Raf cappuccino",
        price: 1450,
        description:"A creamy and lightly sweet coffee made with espresso, vanilla sugar, and warm cream",
        category: "cappuccino",
        image_url: "images/raf.jpg"
    },
    { 
        name: "Chocolate Espresso Martini", 
        price: 1650, 
        description:"A rich and indulgent blend of espresso, chocolate, and smooth vodka for a bold, dessert-style cocktail",
        category: "espresso", 
        image_url: "images/chocolate_expresso_martini.jpg" 
    },
    {
        name: "Double Espresso",
        price: 850,
        description:"Rich and bold concentrated coffee shots",
        category: "espresso",
        image_url:"images/double_espresso.jpg"

    },
    {
        name: "Espresso Tonic",
        price: 1350,
        category: "espresso",
        description:"A refreshing mix of bold espresso and crisp tonic water with a bright, bubbly finish",
        image_url: "images/espresso_tonic.jpg"
    },
    {
        name: "Espresso",
        price: 650,
        description:"Rich concentrated coffee shot",
        category: "espresso",
        image_url: "images/espresso.jpg"
    },
    { 
        name: "Iced Latte", 
        price: 1150, 
        description:"Chilled espresso with cold milk over ice for a smooth, refreshing sip",
        category: "latte", 
        image_url: "images/iced_latte.jpg" 
    },
    { 
        name: "Matcha Latte", 
        price: 1250, 
        description:"Earthy matcha green tea whisked with milk for a smooth, calming boost",
        category: "latte", 
        image_url: "images/matcha_latte.jpg" 
    },
    {
        name: "Latte",
        price: 1050,
        description:"Smooth espresso with creamy steamed milk for a classic, mellow coffee",
        category: "latte",
        image_url: "images/latte.jpg"
    },
    {
        name: "Macchiato Latte",
        price: 1350,
        description:"Espresso blended with rich chocolate and milk for a sweet, coffee-chocolate combo",
        category: "latte",
        image_url: "images/mocha_latte.jpg6 "
    },
    { 
        name: "Tiramisu", 
        price: 1450, 
        description: "A classic Italian dessert with coffee-soaked sponge layers and creamy mascarpone, lightly dusted with cocoa",
        category: "pastry", 
        image_url: "images/tiramisu.jpg" 
    },
    { 
        name: "Cinnamon rolls", 
        price: 1450, 
        description:"Warm, soft rolls swirled with cinnamon sugar and topped with sweet glaze or cream",
        category: "pastry", 
        image_url: "images/cinnamon_rolls.jpg" 
    },
    { 
        name: "Macarons", 
        price: 1550, 
        description:"Delicate French almond cookies with a crisp shell and creamy filling in the middle",
        category: "pastry", 
        image_url: "images/macarons.jpg" 
    },
    { 
        name: "Cakes", 
        price: 1250, 
        description:"Soft and layered desserts with rich cream or chocolate, perfect for a sweet treat with coffee",
        category: "pastry", 
        image_url: "images/cakes.jpg" 
    }
];

const seedDB = async () => {
    if (!MONGO_URI) {
        console.error("Error: MONGO_URI is not defined in .env file");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        await Product.deleteMany({}); 
        console.log("Old products cleared.");

        await Product.insertMany(products);
        console.log("Database Seeded!");
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDB();