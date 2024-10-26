const mongoose = require('mongoose');

const authDataSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },   // Unique key for each entry
    credentials: { type: Object, required: true },         // Object to store credentials
    lastUpdated: { type: Date, default: Date.now },        // Timestamp for updates
});

module.exports = mongoose.model('AuthData', authDataSchema);
