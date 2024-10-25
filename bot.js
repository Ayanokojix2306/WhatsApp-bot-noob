const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000; // Render provides a PORT environment variable

const { state, saveState } = useSingleFileAuthState('./auth_info.json');
let qrCodeData = null; // Variable to store the QR code data

async function connectToWhatsApp() {
    const sock = makeWASocket({
        auth: state,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = await qrcode.toDataURL(qr); // Generate a data URL for the QR code
            console.log('QR code updated');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp(); // Reconnect if not logged out
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp');
        }
    });

    sock.ev.on('creds.update', saveState); // Save authentication state for future use

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            console.log(`Received message: ${message.message.conversation}`);
            await sock.sendMessage(message.key.remoteJid, { text: 'Hello! This is my first bot response!' });
        }
    });
}

// Serve an HTML page with the QR code
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>WhatsApp Bot QR Code</h1>
                ${qrCodeData ? `<img src="${qrCodeData}" alt="QR Code"/>` : '<p>QR code not yet generated. Please wait...</p>'}
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    connectToWhatsApp(); // Start the WhatsApp connection when the server starts
});
