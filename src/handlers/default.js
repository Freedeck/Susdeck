const eventNames = require('./eventNames');
const cfg = require('../managers/settings');
const plugins = require('../managers/plugins');
const debug = require('../utils/debug');
const NotificationManager = require('../managers/notifications');
const tsm = require('../managers/temporarySettings');
const pc = require('../utils/picocolors');
const path = require('path');
const zlib = require('zlib');
const { readFileSync } = require('fs');

const serverVersion = 'Freedeck OS-' + require(path.resolve('package.json')).version + 's';

module.exports = {
  name: 'Main',
  id: 'fd.handlers.main',
  exec: ({
    socket,
    io,
    clients,
  }) => {
    socket._id = Math.random() * 2048 + '.fd';
    socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
    socket._clientInfo = {};

    socket.on('disconnect', () => {
      if (socket.user === 'Main') {
        tsm.set('isMobileConnected', false);
        io.emit(eventNames.user_mobile_conn, false);
      }
      if (socket.user === 'Companion') tsm.delete('IC');
      debug.log(
          pc.red('Client ' + socket.user + ' disconnected'),
          'Socket ' + socket._id);
    });
    plugins.plugins().forEach((plugin) => {
      if (plugin.instance.jsSockHook) {
        require(plugin.instance.jsSockHookPath)(socket, io, plugin.instance);
      }
    });

    Object.keys(eventNames.default).forEach((event) => {
      socket.on(eventNames.default[event], (data) => {
        require(`./default.events/${event}`)({io, socket, data});
      });
    });

    socket.on(eventNames.client_greet, (user) => {
      socket.user = user;
      if (user === 'Main') {
        if (tsm.get('isMobileConnected') === undefined) tsm.set('isMobileConnected', false);
        io.emit(eventNames.user_mobile_conn, true);
        tsm.set('isMobileConnected', true);
      }
      if (user === 'Companion') {
        if (tsm.get('IC') === undefined) tsm.set('IC', socket._id);
        if (tsm.get('IC') !== socket._id) {
          socket.emit(eventNames.companion.conn_fail);
          return;
        }
        tsm.set('IC', socket._id);
      }
      console.log('Client ' + user + ' has greeted server at ' + new Date());
      console.log('There are ' + io.engine.clientsCount + ' clients connected, server counted', clients.length);
      const pl = {};
      const plu = plugins.plugins();
      plu.forEach((plugin) => {
        pl[plugin.instance.id] = plugin.instance;
      });
      const plset = {};
      plu.forEach((plugin) => {
        plset[plugin.instance.id] = plugins._settings.get(plugin.instance.id);
      });
      cfg.update();
      const isMobileConnected = tsm.get('isMobileConnected');

      const serverInfo = {
        id: socket._id,
        NotificationManager,
        mobileConnected: isMobileConnected || false,
        tempLoginID: socket.tempLoginID,
        style: JSON.parse(readFileSync(path.resolve('./src/configs/style.json'))),
        plugins: pl,
        plSettings: plset,
        disabled: plugins._disabled,
        events: eventNames,
        version: 'OSH v' + require(path.resolve('package.json')).version,
        server: serverVersion,
        cfg: cfg.settings(),
        profiles: cfg.settings['profiles'],
      };
      zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
        if (err) {
          console.error('Compression error:', err);
          return;
        }

        socket.emit(eventNames.information, buffer);
      });

      socket.emit(eventNames.default.notif, JSON.stringify({
        sender: 'Server',
        data: 'Connected to server!',
        isCon: true,
      }));

      socket.on(eventNames.information, (data) => {
        socket._clientInfo = data;
        debug.log('Companion using APIv' + data.apiVersion);
      });
    });
  },
};
