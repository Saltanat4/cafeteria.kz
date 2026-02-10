require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db.config'); 
const Order = require('./models/order.model');

async function resetStatuses() {
    try {
        await connectDB();

        const result = await Order.updateMany(
            { status: { $in: ['completed', 'cancelled'] } },
            { $set: { status: 'pending' } }
        );

        console.log(`Updated orders: ${result.modifiedCount}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetStatuses();
