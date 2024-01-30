const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const picocolors = require('./utils/picocolors');

const config = require('./managers/settings');
const settings = config.settings();

const PORT = settings.port || 5754;

const networkAddresses = require('./managers/networkAddresses');

const debug = require('./utils/debug');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

const handlers = new Map();
const pl = require(path.resolve('./src/managers/plugins'));
const plugins = pl.plugins();

fs.readdirSync(path.resolve('./src/handlers')).forEach((file) => {
  const handler = require(`./handlers/${file}`);
  if (!handler.exec) return;
  handlers.set(handler.name, handler);
});
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
    debug.log(picocolors.green('Added new event ' + event), 'SAPIConn');
  };
  socket.emit = (event, data) => {
    if (clients.length === 1) return;
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

app.use(express.static(path.join(__dirname, './public')));

app.get('/fdc', (req, res) => res.sendStatus(200));

app.post('/fd/api/upload/', (request, response) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.resolve('./src/public/sounds'),
  });
  // Parse `req` and upload all associated files
  form.parse(request, (err, fields, files) => {
    if (err) {
      return response.status(400).json({error: err.message});
    }

    const nfp = files.file[0].filepath;
    const ext = files.file[0].mimetype.split('/')[1];

    fs.renameSync(nfp, nfp + '.' + ext);
    response.send({oldName: files.file[0].originalFilename, newName: files.file[0].newFilename + '.' + ext});
  });
});

server.listen(PORT, () => {
  Object.keys(networkAddresses()).forEach((netInterface) => {
    const ipPort = networkAddresses()[netInterface][0] + ':' + PORT;
    console.log(picocolors.bgBlue('Go to ' + ipPort + ' on your mobile device [Interface ' + netInterface + ']'));
  });
});
