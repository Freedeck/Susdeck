const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const picocolors = require('./utils/picocolors');
const debug = require('./utils/debug');
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

io.on('connection', (socket) => {
  setInterval(() => {
    plugins.forEach((plugin) => {
      plugin = plugin.instance;
      plugin.channelsCreated.forEach((channel) => {
        if (!channels.has(channel)) {
          channels.set(channel, []);
        }
      });
      plugin.channelsSendQueue.forEach((channel) => {
        if (channels.has(channel.channel)) {
          channels.get(channel.channel).push(channel.data);
          plugin.channelsSendQueue.splice(plugin.channelsSendQueue.indexOf(channel), 1);
        }
      });
      plugin.channelsListening.forEach((channel) => {
        if (channels.has(channel.channel)) {
          channels.get(channel.channel).forEach((callback) => {
            channel.callback(callback);
            clients.forEach((client) => {
              client.emit('channel_' + plugin.id + '_' + channel.channel, callback);
            });
            channels.get(channel.channel).splice(channels.get(channel.channel).indexOf(callback), 1);
          });
        }
      });
    });
  });
  clients.push(socket);
  socket._originalOn = socket.on;
  socket._originalEmit = socket.emit;
  socket.on = (event, callback) => {
    socket._originalOn(event, callback);
    debug.log(picocolors.green('Listening for event ' + event), 'SAPIConn');
  };
  socket.emit = (event, data) => {
    socket._originalEmit(event, data);
    debug.log(picocolors.green('Emitted new event ' + event + ', data: ' + JSON.stringify(data)), 'SAPIConn');
  };

  socket.on('disconnect', () => {
    clients.splice(clients.indexOf(socket), 1);
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
