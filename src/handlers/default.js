const eventNames = require('./eventNames');
const cfg = require('../loaders/settingsCache').settings();
const plugins = require('../loaders/pluginLoader').plugins;
const debug = require("../utils/debug");
const NotificationManager = require('../loaders/NotificationManager');
const tsm = require('../loaders/TemporarySettingsManager');
const picocolors = require('../utils/picocolors');

module.exports = {
    name: 'Main',
    id: 'fd.handlers.main',
    exec: ({socket}) => {
        socket.id = Math.random() * 2048 + '.fd';
        socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
        socket._clientInfo = {};
        socket.on('disconnect', () => {
            if (socket.user === 'Companion') tsm.set('companion', false);
            debug.log(picocolors.red('Client ' + socket.user + ' disconnected'), 'Socket ' + socket.id)
        });
        socket.on(eventNames.client_greet, (user) => {
            socket.user = user;
            if (user === 'Companion') {
                if (tsm.get('companion') === true) {
                    socket.emit(eventNames.companion_conn_fail);
                    return;
                }
                tsm.set('companion', true);
            }
            console.log('Client ' + user + ' has greeted server at ' + new Date());
            socket.emit(eventNames.information, JSON.stringify({ id: socket.id, NotificationManager, tempLoginID: socket.tempLoginID, plugins: Array.from(plugins().keys()), events: eventNames, cfg }));
            setInterval(() => {
                let data = NotificationManager.get();
                if (data === '' || typeof data === 'undefined' || !('data' in data)) return;
                socket.emit(eventNames.notif, JSON.stringify(data));
            },150);
            socket.emit(eventNames.notif, JSON.stringify({sender:'Server', data:'Connected to server!'}));
            socket.on(eventNames.plugin_info, (data) => {
                const plug = plugins().get(data);
                socket.emit(eventNames.plugin_info, JSON.stringify({requested: data, response: plug}))
            })
            socket.on(eventNames.information, (data) => {
                socket._clientInfo = data;
                debug.log('Companion using APIv' + data.apiVersion);
            });
        })
    }
}
