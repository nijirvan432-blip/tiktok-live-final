const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('@someuser/tiktok-live-connector');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Initialize Gemini API (2026 SDK)
const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6IrFIAHx7lSTrbT3Am9y6oBSBRoTVlfeUnMAcb5e_fdvA" });

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Client connected to backend server');

    socket.on('start-live', (username) => {
        let tiktokConnection = new WebcastPushConnection(username);

        // 1. Welcome new members joining the live
        tiktokConnection.on('member', async (data) => {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: Welcome the new viewer named ${data.uniqueId} with a very short, friendly welcome phrase suitable for a gaming stream. Detect their language and reply in Arabic or English accordingly.,
                });
                socket.emit('ai-response', { text: response.text, type: 'welcome' });
            } catch (err) { console.error(err); }
        });

        // 2. Reply to chat comments
        tiktokConnection.on('chat', async (data) => {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: data.comment,
                    config: {
                        systemInstruction: "You are a friendly and fun live gaming stream assistant. Reply to the user comments. Your response must be extremely short (maximum one sentence) and written in the exact same language as the user comment (Arabic or English)."
                    }
                });
                socket.emit('ai-response', { text: response.text, type: 'chat' });
            } catch (err) { console.error(err); }
        });

        tiktokConnection.connect().then(() => {
            socket.emit('status', 'Connected to TikTok Live successfully!');
        }).catch(() => {
            socket.emit('status', 'Connection failed. Make sure you are currently LIVE.');
        });
    });
});

server.listen(3000, () => console.log('Server is running on port 3000'));