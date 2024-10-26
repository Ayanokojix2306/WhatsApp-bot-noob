async function newMongoAuthState() {
    const get = async (key) => {
        const data = await AuthData.findOne({ key });
        return data ? data.credentials : null;
    };

    const set = async (key, credentials) => {
        await AuthData.findOneAndUpdate(
            { key },
            { credentials, lastUpdated: Date.now() },
            { upsert: true }
        );
    };

    return { state: { get, set } };
}
module.exports = newMongoAuthState
