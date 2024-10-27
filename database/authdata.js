const mongoose = require('mongoose');

// Define a schema for WhatsApp authentication data
const authSchema = new mongoose.Schema({
    key: {
        // You can adjust the structure based on the authentication data you want to store
        type: Object,
        required: true,
    },
    credentials: {
        // This can also be customized depending on the credentials structure
        type: Object,
        required: true,
    },
});

// Create a model for the authentication data
const AuthData = mongoose.model('AuthData', authSchema);

module.exports = AuthData;
