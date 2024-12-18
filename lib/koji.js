const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const { newMongoAuthState, getMongoAuthState } = require('../database/newMongoAuthState.js');
const express = require('express');
const connectDB = require('../database/mongodb.js');
const qrcode = require('qrcode'); // Updated to use qrcode package
const app = express();
const port = process.env.PORT || 10000;

// Connect to MongoDB
connectDB().catch(error => {
    console.error('MongoDB connection error:', error);
});

// Function to initialize authentication state
async function initializeAuth() {
    await newMongoAuthState(); // Initialize MongoDB auth if it doesn’t already exist
}

// Function to connect to WhatsApp
async function connectToWhatsApp() {
    await initializeAuth(); // Ensure auth state is initialized before attempting connection
    const { state, saveCreds } = await getMongoAuthState(); // Retrieve the auth state from MongoDB

    // Check if saveCreds is a function
    if (typeof saveCreds !== 'function') {
        console.error('saveCreds is not a function');
        return; // Exit if saveCreds is not valid
    }

    const conn = makeWASocket({
        auth: state,
    });

    // Handle connection updates
    conn.ev.on('connection.update', async (update) => {
        console.log('Connection update:', update); // Log the entire update object for debugging
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate QR code and save it as an image data URL
            try {
                currentQrCode = await qrcode.toDataURL(qr); // Generate QR code as a Data URL
                console.log('New QR Code generated:', currentQrCode); // Log the QR code (optional)
            } catch (error) {
                console.error('Error generating QR Code:', error);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp');
        }
    });

    conn.ev.on('creds.update', saveCreds); // Save updated credentials to MongoDB

    conn.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            // Log the received message (optional)
            console.log(`Received message: ${message.message.conversation}`);

            // Check if the received message is the ".menu" command
            if (message.message.conversation === 'menu') {
                try {
                    await conn.sendMessage(message.key.remoteJid, { text: "I'm sorry you haven't completed your bot. Add a menu later, bro. I know that you want to rush yourself to create your WhatsApp bot, but calm down. You are going to get there ❤️." });
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }
        }
    });
}

// Serve an HTML page with the QR code
let currentQrCode = ''; // Variable to store the latest QR code data

app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>WhatsApp Bot QR Code</h1>
                <p>Scan the QR code below to connect:</p>
                <img id="qr-code" src="${currentQrCode}" alt="QR Code" />
                <script>
                    setInterval(async () => {
                        const response = await fetch('/qr');
                        const qrCodeData = await response.text();
                        document.getElementById('qr-code').src = qrCodeData; // Update QR code in the image source
                    }, 6000); // Check every 6 seconds for a new QR code
                </script>
            </body>
        </html>
    `);
});

// Endpoint to serve the current QR code
app.get('/qr', (req, res) => {
    res.send(currentQrCode || 'QR code not yet generated. Please wait...');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    connectToWhatsApp(); // Start the WhatsApp connection when the server starts
});

module.exports = connectToWhatsApp;
