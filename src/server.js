const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const picocolors = require('./utils/picocolors');
const debug = require('./utils/debug');
const NotificationManager = require(path.resolve('./src/managers/notifications'));
const eventNames = require(path.resolve('./src/handlers/eventNames'));
const {server} = require('./http');
const io = new socketIO.Server(server);

const handlers = new Map();
const pl = require(path.resolve('./src/managers/plugins'));
const plugins = pl.plugins();

fs.readdirSync(path.resolve('./src/handlers')).forEach((file) => {
  if (fs.lstatSync(path.resolve('./src/handlers/' + file)).isDirectory()) return;
  const handler = require(`./handlers/${file}`);
  if (!handler.exec) return;
  handlers.set(handler.name, handler);
});

if (!fs.existsSync('plugins')) {
  fs.mkdirSync('plugins');
}

const types = pl.types;

pl.update();

const clients = [];

console.log('Initializing server...');

io.on('connection', (socket) => {
  socket._originalOn = socket.on;
  socket._originalEmit = socket.emit;

  /**
       * Send latest notification to Freedeck Client.
       * @param {Object} notification Notification data for Freedeck Client to parse.
       */
  function sendNotification(notification) {
    if(notification.sender == 'handoff-api') {
      switch(notification.data) {
        case 'reload-plugins':
          io.emit(eventNames.default.plugins_updated);
          break;
      }
      return;
    }
    io.emit(eventNames.default.notif, JSON.stringify(notification));
    NotificationManager.once('newNotification', sendNotification);
  }

  NotificationManager.once('newNotification', sendNotification);

  socket.on = (event, callback) => {
    socket._originalOn(event, callback);
    debug.log(picocolors.green('Listening for event ' + event), 'SAPIConn');
  };
  socket.emit = (event, data) => {
    socket._originalEmit(event, data);
    if(event != 'I')debug.log(picocolors.green('Emitted new event ' + event + ', data: ' + JSON.stringify(data)), 'SAPIConn');
  };

  if (!clients.includes(socket)) {
    console.log('Client has connected');
    clients.push(socket);
  }

  socket.on('disconnect', () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
      NotificationManager.removeListener('newNotification', sendNotification);
    }
  });

  try {
    handlers.forEach((handler) => {
      try {
        handler.exec({socket, types, plugins, io, clients});
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(picocolors.cyan('Added new handler ' + handler.name) + '- for ' + socket._id + '\n', 'SAPI');
    });
  } catch (e) {
    debug.log(picocolors.red(e));
  }
});
