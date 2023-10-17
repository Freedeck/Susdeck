const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

const handlers = new Map();

fs.readdirSync(path.resolve('./src/handlers')).forEach((file) => {
    const handler = require(`./handlers/${file}`);
    if (!handler.exec) return;
    handlers.set(handler.name, handler);
    console.log('New handler', handler.name);
});

io.on('connection', (socket) => {
    handlers.forEach(handler => {
        handler.exec(socket);
        console.log('Added new event ' + handler.name);
    })
});

app.use(express.static(path.join(__dirname, './public')));

server.listen(5754, () => console.log('listening on *:3000'));
