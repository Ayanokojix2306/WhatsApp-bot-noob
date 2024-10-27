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

    // Always return the auth state, even if it’s new/empty
    return { state: auth, saveCreds };
}

// Function to get the existing MongoDB auth state
async function getMongoAuthState() {
    const existingAuthData = await AuthData.findOne();
    console.log('Existing Auth Data:', existingAuthData); // Log the existing auth data
    return existingAuthData ? { state: existingAuthData } : { state: { creds: {}, keys: {} } }; // Ensure a valid state is returned
}

module.exports = {
    newMongoAuthState,
    getMongoAuthState,
};
