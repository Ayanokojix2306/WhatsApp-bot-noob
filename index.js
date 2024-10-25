const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const { useMultiFileAuthState } = require('@whiskeysockets/baileys/lib/Utils'); // Import from the correct path
// Update this line to match your package
const express = require('express');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set up the state for authentication
const { state, saveCreds } = useMultiFileAuthState('./auth_info_baileys');

// Function to connect to WhatsApp
async function connectToWhatsApp() {
    const sock = makeWASocket({
        auth: state,
    });

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate and display the QR code in the terminal
            qrcode.generate(qr, { small: true }, (qrcode) => {
                console.log('QR code generated:\n', qrcode);
            });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp(); // Reconnect if not logged out
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp');
        }
    });

    sock.ev.on('creds.update', saveState); // Save authentication state

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            console.log(`Received message: ${message.message.conversation}`);
            await sock.sendMessage(message.key.remoteJid, { text: 'Hello! This is my first bot response!' });
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
                        document.getElementById('qr-code').src = qrCodeData;
                    }, 2000); // Check every 2 seconds for a new QR code
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
