// index.js
const connectDB = require('./database/mongodb');
const bot = require('./lib/koji');

// Connect to MongoDB
connectDB();

// Start the WhatsApp bot
bot();
