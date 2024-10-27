const AuthData = require('./authdata');

// Function to create a new MongoDB auth state
async function newMongoAuthState() {
    // Attempt to get existing auth data first
    const existingAuthData = await AuthData.findOne();
    const auth = existingAuthData || {
        creds: {}, // Baileys expects `creds` to handle credentials
        keys: {}   // Baileys expects `keys` to handle encryption keys
    };

    // Define the `saveCreds` function to save the auth state
    const saveCreds = async () => {
        try {
            await AuthData.updateOne({}, auth, { upsert: true });
            console.log('Auth credentials saved to MongoDB');
        } catch (error) {
            console.error('Error saving credentials to MongoDB:', error);
        }
    };

    // Return both the auth state and saveCreds function as an object
    return { state: auth, saveCreds };
}

// Function to get the existing MongoDB auth state
async function getMongoAuthState() {
    const existingAuthData = await AuthData.findOne();
    if (existingAuthData) {
        // Return auth state with `saveCreds` function if data exists
        return { state: existingAuthData, saveCreds: newMongoAuthState().saveCreds };
    } else {
        console.error('No auth data found in MongoDB. Initializing new auth state.');
        return newMongoAuthState(); // Return a new state if none exists
    }
}

module.exports = {
    newMongoAuthState,
    getMongoAuthState,
};
