const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function connectToWhatsApp() {
    const sock = makeWASocket({
        auth: state,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate the QR code only if it's not already generated
            const qrCodeData = await qrcode.toDataURL(qr);
            console.log('QR code generated');

            // Send the QR code data to the express route
            app.get('/qr', (req, res) => {
                res.send(qrCodeData);
            });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp');
        }
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.key.fromMe && m.type === 'notify') {
            console.log(`Received message: ${message.message.conversation}`);
            await sock.sendMessage(message.key.remoteJid, { text: 'Hello! This is my first bot response!' });
        }
    });
}

// Serve an HTML page that displays the QR code
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>WhatsApp Bot QR Code</h1>
                <p>Scan the QR code below to connect:</p>
                <img id="qr-code" alt="QR Code" />
                <script>
                    setInterval(async () => {
                        const response = await fetch('/qr');
                        const qrCodeData = await response.text();
                        document.getElementById('qr-code').src = qrCodeData;
                    }, 6000);
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    connectToWhatsApp(); // Start the WhatsApp connection when the server starts
});
