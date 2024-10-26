// database/newMongoAuthState.js
const AuthData = require('../authdata');

// Function to create a new MongoDB auth state
async function newMongoAuthState() {
    const auth = {
        key: {}, // Initialize key object here
        credentials: {}, // Initialize credentials object here
    };

    // Logic to save to MongoDB
    const newAuthData = new AuthData(auth);
    await newAuthData.save();
    
    return auth; // Return the auth object
}

// Function to get the existing MongoDB auth state
async function getMongoAuthState() {
    const existingAuthData = await AuthData.findOne(); // Fetch the first document
    return existingAuthData || {}; // Return the found data or an empty object
}

module.exports = {
    newMongoAuthState,
    getMongoAuthState,
};
