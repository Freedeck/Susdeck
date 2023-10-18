const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

const handlers = new Map();
const plugins = new Map();

fs.readdirSync(path.resolve('./src/handlers')).forEach((file) => {
    const handler = require(`./handlers/${file}`);
    if (!handler.exec) return;
    handlers.set(handler.name, handler);
    console.log('New handler', handler.name);
});

fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
    const plugin = require(path.resolve(`./plugins/${file}`));
    const instantiated = new plugin();
    console.log('New plugin ' + instantiated.name);
})

io.on('connection', (socket) => {
    handlers.forEach(handler => {
        const callback = handler.exec({socket, plugins});
        console.log('Added new event ' + handler.name);
    })
});

require('./companionInit')

app.use(express.static(path.join(__dirname, './public')));

server.listen(5754, () => console.log('listening on *:3000'));

module.exports = plugins;
