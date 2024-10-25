const connectDB = require('./database/mongodb');
const connectToWhatsApp = require('./lib/koji');

// Connect to MongoDB
connectDB();

// Start the WhatsApp bot
connectToWhatsApp(); // Correctly invoke the function to start the bot
