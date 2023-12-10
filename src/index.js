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
const NotificationManager = require('./managers/notifications');

const debug = require('./utils/debug');
const eventNames = require('./handlers/eventNames');

if (process.argv[2] === 'server') { console.log(picocolors.blue('Server only mode.')); } else { require('./companionInit'); }
if (process.argv[2] === 'companion') return;

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

app.get('/fdc', (req,res) => res.sendStatus(200));

app.post('/fd/api/upload/', (request,response) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.resolve('./src/public/sounds')
      });
      // Parse `req` and upload all associated files
      form.parse(request, (err, fields, files) => {
        if (err) {
          return response.status(400).json({ error: err.message });
        }
  
        const nfp = files.file[0].filepath;
        const ext = files.file[0].mimetype.split('/')[1];
  
        fs.renameSync(nfp, nfp + '.' + ext);
        response.send({ oldName: files.file[0].originalFilename, newName: files.file[0].newFilename + '.' + ext });
      });
})

server.listen(PORT, () => {
    Object.keys(networkAddresses()).forEach(netInterface => {
        const ipPort = networkAddresses()[netInterface][0] + ':' + PORT;
        console.log(picocolors.bgBlue('Go to ' + ipPort + ' on your mobile device [Interface ' + netInterface + ']'));
    })
});
