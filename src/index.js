const ex = require('express');
const path = require('path');
const httpLib = require('http');

const app = ex();
const httpServer = new httpLib.Server(app);
const io = require('socket.io')(httpServer);

const settings = require('../Settings');
const getNetworkInterfaces = require('./util/network');
const sockApiInit = require('./api/init').init;

const port = settings.Port || process.env.PORT || 5754;

try {
  sockApiInit(io, app); // Socket API initialize

  app.use('/', ex.static('./src/app')); // Initialize HTTP routes for main web app directory

  app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '/settings/sounds.js')); }); // Make sounds.js accessible from apps

  httpServer.listen(port, () => {
    console.log('Susdeck v' + require('../package.json').version + ' Web Host is starting - starting Companion');
    require('child_process').exec('npx electron src/companion'); // Start Companion on another process
    Object.keys(getNetworkInterfaces()).forEach(netInterface => {
      console.log('Go to ' + getNetworkInterfaces()[netInterface][0] + ':' + port + ' on your mobile device [Interface ' + netInterface + ']');
    });
  });
} catch (err) {
  console.log('Presumably fatal error:',err);
}
