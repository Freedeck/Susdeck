const ex = require('express');
const path = require('path');
const httpLib = require('http');

const app = ex();
const debug = require('./util/debug');
const httpServer = new httpLib.Server(app);
const io = require('socket.io')(httpServer);

const settings = require('../Settings');
const getNetworkInterfaces = require('./util/network');
const sounds = require('./settings/sounds');
const fd = require('../package.json');
const sockApiInit = require('./api/init').init;

const port = settings.Port || process.env.PORT || 5754;

try {
  console.clear();
  console.log('Freedeck v' + fd.version);
  debug.log('Version matching');
  // Do config versions match the hosts?
  if (settings.fdv !== fd.version) {
    console.log('[IMPORTANT!]\nYour settings config is out of date. Rerun npm run setup to update it!\nExpected version ' + fd.version +', got ' + settings.fdv);
  }
  if (sounds.cfg.v !== fd.version) {
    console.log('[IMPORTANT!]\nYour sound config is out of date. If Freedeck doesn\'t load, rerun npm run setup.\nIf Freedeck functions, use companion to:\n1: Edit any sound from the Icon Editor\n2:Press Set\n3:Update will automagically complete.\nExpected version ' + fd.version + ', got ' + sounds.cfg.v);
  }
  debug.log('Initializing Socket API');
  sockApiInit(io, app); // Socket API initialize

  debug.log('Initializing HTTP routes');
  app.use('/', ex.static('./src/app')); // Initialize HTTP routes for main web app directory

  app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '/settings/sounds.js')); }); // Make sounds.js accessible from apps

  debug.log('Listening for ' + port);
  if (process.argv[2] === '--no-server') {
    console.log('Companion is starting in serverless mode!');
    require('child_process').exec('npx electron src/companion'); // Start Companion on another process
  }
  if (process.argv[2] !== '--no-server') {
    httpServer.listen(port, () => {
      console.log('Web Host is starting - launching Companion');
      if (process.argv[2] !== '--headless') require('child_process').exec('npx electron src/companion'); // Start Companion on another process
      Object.keys(getNetworkInterfaces()).forEach(netInterface => {
        console.log('Go to ' + getNetworkInterfaces()[netInterface][0] + ':' + port + ' on your mobile device [Interface ' + netInterface + ']')
      });
    });
  }
} catch (err) {
  console.log('Presumably fatal error:', err);
}
