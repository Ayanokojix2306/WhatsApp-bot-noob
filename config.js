const config = {
    MONGODB_URI: process.env.MONGODB_URI || '', // Fallback for local development
    SERVER_PORT: process.env.PORT || 3000, // Option to set server port
    API_KEY: process.env.API_KEY || 'your_local_api_key', // Example of another config variable
};

module.exports = config;
