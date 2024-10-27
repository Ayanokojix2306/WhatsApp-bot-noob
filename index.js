const connectDB = require(__dirname + '/database/mongodb'); // No changes to path
const connectToWhatsApp = require(__dirname + '/lib/koji'); // No changes to path

(async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB successfully.');
        
        console.log('Attempting to start WhatsApp bot...');
        
        // Start the WhatsApp bot
        await connectToWhatsApp();
        console.log('WhatsApp bot started successfully.');
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
})();
