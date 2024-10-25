const connectDB = require(__dirname + '/database/mongodb'); // Updated import
const connectToWhatsApp = require(__dirname + '/lib/koji'); // Updated import

// Connect to MongoDB
connectDB();

// Start the WhatsApp bot
connectToWhatsApp();
