const connectDB = require('../database/mongodb.js'); // Check the path
const connectToWhatsApp = require('./lib/koji.js');

// Connect to MongoDB
connectDB();

// Start the WhatsApp bot
connectToWhatsApp(); // Correctly invoke the function to start the bot
