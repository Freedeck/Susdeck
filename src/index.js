const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const picocolors = require('./utils/picocolors');

const debug = require('./utils/debug');

if (process.argv[2] === 'server') { debug.log(picocolors.blue('Server only mode.')); } else { require('./companionInit'); }
if (process.argv[2] === 'companion') return;

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

const handlers = new Map();
const pl = require(path.resolve('./src/loaders/pluginLoader'));
const plugins = pl.plugins;

fs.readdirSync(path.resolve('./src/handlers')).forEach((file) => {
    const handler = require(`./handlers/${file}`);
    if (!handler.exec) return;
    handlers.set(handler.name, handler);
});
const types = pl.types;

pl.update();

io.on('connection', (socket) => {
    try {
        handlers.forEach(handler => {
            try {
                const callback = handler.exec({socket, types, plugins, io});
            } catch(e) {
                debug.log(picocolors.red(e));
            }
            debug.log(picocolors.cyan('Added new handler ' + handler.name), 'SAPI');
        })
    } catch(e) {
        debug.log(picocolors.red(e));
    }
});

app.use(express.static(path.join(__dirname, './public')));
server.listen(5754, () => {

});
