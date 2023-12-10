const eventNames = require('./eventNames');
const cfg = require('../managers/settings');
const plugins = require('../managers/plugins').plugins;
const debug = require("../utils/debug");
const NotificationManager = require('../managers/notifications');
const tsm = require('../managers/temporarySettings');
const picocolors = require('../utils/picocolors');

module.exports = {
    name: 'Main',
    id: 'fd.handlers.main',
    exec: ({socket, io}) => {
        socket._id = Math.random() * 2048 + '.fd';
        socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
        socket._clientInfo = {};
        socket.on('disconnect', () => {
            if (socket.user === 'Companion') tsm.delete('companion');
            debug.log(picocolors.red('Client ' + socket.user + ' disconnected'), 'Socket ' + socket._id)
        });
        socket.on(eventNames.client_greet, (user) => {
            socket.user = user;
            if (user === 'Companion') {
                if (tsm.get('companion') === undefined) tsm.set('companion', socket._id);
                if (tsm.get('companion') !== socket._id) {
                    socket.emit(eventNames.companion.conn_fail);
                    return;
                }
                tsm.set('companion', socket._id);
            }
            console.log('Client ' + user + ' has greeted server at ' + new Date());
            let serverInfo = {
                id: socket._id,
                NotificationManager,
                tempLoginID: socket.tempLoginID,
                plugins: Array.from(plugins().keys()),
                events: eventNames,
                cfg: cfg.settings(),
                profiles: cfg.settings['profiles'],
            }
            socket.emit(eventNames.information, JSON.stringify(serverInfo));
            setInterval(() => {
                cfg.update();
                serverInfo['cfg'] = cfg.settings();
                socket.emit(eventNames.no_init_info, JSON.stringify(serverInfo));
                let data = NotificationManager.get();
                if (data === '' || typeof data === 'undefined' || !('data' in data)) return;
                io.emit(eventNames.notif, JSON.stringify(data));
            },150);
            socket.emit(eventNames.notif, JSON.stringify({sender:'Server', data:'Connected to server!', isCon:true}));
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
