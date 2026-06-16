const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('TikTok AI Bot Server is running!');
});

io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('tiktok-comment', (data) => {
        io.emit('avatar-speak', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
