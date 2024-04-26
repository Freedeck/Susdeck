const eventNames = require('./eventNames');
const cfg = require('../managers/settings');
const plugins = require('../managers/plugins').plugins;
const debug = require('../utils/debug');
const NotificationManager = require('../managers/notifications');
const tsm = require('../managers/temporarySettings');
const pc = require('../utils/picocolors');
const path = require('path');

const serverVersion = 'Freedeck OS-' + require(path.resolve('package.json')).version + 's';

module.exports = {
  name: 'Main',
  id: 'fd.handlers.main',
  exec: ({
    socket,
    io,
  }) => {
    socket._id = Math.random() * 2048 + '.fd';
    socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
    socket._clientInfo = {};

    socket.on('disconnect', () => {
      if (socket.user === 'Companion') tsm.delete('IC');
      debug.log(
          pc.red('Client ' + socket.user + ' disconnected'),
          'Socket ' + socket._id);
    });
    plugins().forEach((plugin) => {
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
      if (user === 'Companion') {
        if (tsm.get('IC') === undefined) tsm.set('IC', socket._id);
        if (tsm.get('IC') !== socket._id) {
          socket.emit(eventNames.companion.conn_fail);
          return;
        }
        tsm.set('IC', socket._id);
      }
      console.log('Client ' + user + ' has greeted server at ' + new Date());
      const pl = {};
      const plu = plugins();
      plu.forEach((plugin) => {
        pl[plugin.instance.id] = plugin.instance;
      });
      cfg.update();
      const serverInfo = {
        id: socket._id,
        NotificationManager,
        tempLoginID: socket.tempLoginID,
        plugins: pl,
        events: eventNames,
        version: 'OSH v' + require(path.resolve('package.json')).version,
        server: serverVersion,
        cfg: cfg.settings(),
        profiles: cfg.settings['profiles'],
      };

      socket.emit(eventNames.information, JSON.stringify(serverInfo));

      setInterval(() => {
        // cfg.update();
        // serverInfo['cfg'] = cfg.settings();
        // socket.emit(eventNames.default.no_init_info, JSON.stringify(serverInfo)); // Test, make sure this is viable.
        const data = NotificationManager.get();
        if (data === '' ||
          typeof data === 'undefined' ||
          !('data' in data)) return;
        io.emit(eventNames.default.notif, JSON.stringify(data));
      }, 150);

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
