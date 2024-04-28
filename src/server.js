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

const channels = pl._ch;
const clients = [];

console.log('Initializing server...');

io.on('connection', (socket) => {
  setInterval(() => {
    for (const pluginObject of plugins) {
      const plugin = pluginObject[1].instance;
      for (const channel of plugin.channelsCreated) {
        if (!channels.has(channel)) {
          channels.set(channel, new Set());
        }
      }
      for (const channel of plugin.channelsSendQueue) {
        if (channels.has(channel.channel)) {
          channels.get(channel.channel).add(channel.data);
          plugin.channelsSendQueue.delete(channel);
        }
      }
      for (const channel of plugin.channelsListening) {
        if (channels.has(channel.channel)) {
          const channelCallbacks = channels.get(channel.channel);
          for (const callback of channelCallbacks) {
            channel.callback(callback);
            for (const client of clients) {
              client.emit(`channel_${plugin.id}_${channel.channel}`, callback);
            }
            channelCallbacks.delete(callback);
          }
        }
      }
    }
  }, 1000);
  socket._originalOn = socket.on;
  socket._originalEmit = socket.emit;

  /**
       * Send latest notification to Freedeck Client.
       * @param {Object} notification Notification data for Freedeck Client to parse.
       */
  function sendNotification(notification) {
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
    debug.log(picocolors.green('Emitted new event ' + event + ', data: ' + JSON.stringify(data)), 'SAPIConn');
  };

  if (!clients.includes(socket)) {
    console.log('Client has connected');
    clients.push(socket);
  }

  socket.on('disconnect', () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });

  try {
    handlers.forEach((handler) => {
      try {
        handler.exec({socket, types, plugins, io});
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(picocolors.cyan('Added new handler ' + handler.name) + '- for ' + socket._id + '\n', 'SAPI');
    });
  } catch (e) {
    debug.log(picocolors.red(e));
  }
});
