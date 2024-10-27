const AuthData = require(__dirname + '/authdata');

// Function to create a new MongoDB auth state
async function newMongoAuthState() {
    // Attempt to get existing auth data first
    const existingAuthData = await AuthData.findOne();
    const auth = existingAuthData || {
        creds: {}, // Baileys expects `creds` to handle credentials
        keys: {}   // Baileys expects `keys` to handle encryption keys
    };

    // Function to save updated credentials to MongoDB
    const saveCreds = async () => {
        await AuthData.updateOne({}, auth, { upsert: true });
    };

    // Returning both the auth state and the saveCreds function
    return { state: auth, saveCreds };
}

// Function to get the existing MongoDB auth state
async function getMongoAuthState() {
    const existingAuthData = await AuthData.findOne();
    return existingAuthData ? { state: existingAuthData } : {};
}

module.exports = {
    newMongoAuthState,
    getMongoAuthState,
};
