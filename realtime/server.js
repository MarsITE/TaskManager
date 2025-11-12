const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {origin: '*'}
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('task-updated', (task) => {
        socket.broadcast.emit('task-updated', task);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Socket.io server running on port 3001');
});
