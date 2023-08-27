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
        console.log('Go to ' + getNetworkInterfaces()[netInterface][0] + ':' + port + ' on your mobile device [Interface ' + netInterface + ']');
      });
    });
  }

  const vCheck = {
    // eslint-disable-next-line eqeqeq
    set: settings.fdv == fd.version,
    // eslint-disable-next-line eqeqeq
    snd: sounds.cfg.v == fd.version
  };

  if (vCheck.set || vCheck.snd) {
    console.log('[IMPORTANT!]\nFreedeck is out of sync with v' + fd.version + '\nAffected configs:');
    if (vCheck.set) console.log('- Settings');
    if (vCheck.snd) console.log('- Sounds');
    console.log('[IMPORTANT!] These configs will be updated and you will need to start Freedeck again.');
  }
} catch (err) {
  console.log('Presumably fatal error:', err);
}
