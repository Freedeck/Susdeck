const eventNames = require('./eventNames');
const cfg = require('../loaders/settingsCache').settings();
const plugins = require('../loaders/pluginLoader').plugins;
const debug = require("../utils/debug");
const picocolors = require('../utils/picocolors');

module.exports = {
    name: 'Main',
    id: 'fd.handlers.main',
    exec: ({socket}) => {
        socket.id = Math.random() * 2048 + '.fd';
        socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
        socket.on('disconnect', () => debug.log(picocolors.red('Client disconnected'), 'Socket ' + socket.id));
        socket.on(eventNames.client_greet, (user) => {
            socket.user = user;
            console.log('Client ' + user + ' has greeted server at ' + new Date());
            socket.emit(eventNames.information, JSON.stringify({ id: socket.id, tempLoginID: socket.tempLoginID, plugins: Array.from(plugins().keys()), events: eventNames, cfg }));
            socket.emit(eventNames.notif, 'Connected to server!')
        })
    }
}
