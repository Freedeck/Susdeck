const ex = require('express');
const path = require('path');
const fs = require('fs');
const httpLib = require('http');

const app = ex();
const debug = require('./util/debug');
const httpServer = new httpLib.Server(app);
const io = require('socket.io')(httpServer);

const settings = require('../Settings');
const getNetworkInterfaces = require('./util/network');
const sounds = require('./settings/sounds');
const fd = require('../package.json');
const picocolors = require('./util/picocolors');
const { createHash } = require('./util/crypto');
const sockApiInit = require('./api/init').init;

const INIT_START_TIME = new Date();

const port = settings.Port || process.env.PORT || 5754;

try {
  console.clear();
  console.log(picocolors.blue('Freedeck v' + fd.version));
  if (debug.is) debug.log('Using debug mode');

  debug.log('Initializing Socket API');
  sockApiInit(io, app); // Socket API initialize

  debug.log('Initializing HTTP routes');
  app.use('/', ex.static('./src/app')); // Initialize HTTP routes for main web app directory

  app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '/settings/sounds.js')); }); // Make sounds.js accessible from apps

  if (process.argv[2] === '--no-server') {
    console.log('Companion is starting in standalone mode!');
    require('child_process').exec('npx electron src/companion'); // Start Companion on another process
  }
  if (process.argv[2] !== '--no-server') hostServer();

  updateFDConfig();
} catch (err) {
  console.log(picocolors.red('Presumably fatal error:'), err);
}

const INIT_END_TIME = new Date();
console.log(picocolors.blue('Initialized in ' + (INIT_END_TIME.getTime() - INIT_START_TIME.getTime()) + 'ms!'));

function launchCompanion () {
  require('child_process').exec('npx electron src/companion');
  return '- launching Companion';
}

function hostServer () {
  debug.log('Listening on port ' + port);
  httpServer.listen(port, () => {
    let str = '';
    if (process.argv[2] !== '--headless') str = launchCompanion();
    console.log(picocolors.blue('Freedeck Web Host started'), picocolors.blue(str));
    Object.keys(getNetworkInterfaces()).forEach(netInterface => {
      const ipPort = getNetworkInterfaces()[netInterface][0] + ':' + port;
      console.log(picocolors.bgBlue('Go to ' + ipPort + ' on your mobile device [Interface ' + netInterface + ']'));
    });
  });
  const SERVER_START_TIME = new Date();
  debug.log(picocolors.blue('Server started in ' + (SERVER_START_TIME.getTime() - INIT_START_TIME.getTime()) + 'ms!') + ' (Relative to init start)', 'INIT');
}

function updateFDConfig () {
  sounds.Sounds.forEach(sound => {
    if (!sound.uuid) {
      debug.log('Sound ' + sound.name + ' has no UUID, fixing');
      sound.uuid = 'FDA-' + require('crypto').randomBytes(8).toString('hex');
    }
  });
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${fd.version}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
  delete require.cache[require.resolve(path.resolve('./src/settings/sounds.js'))];
  debug.log('UUID check finished.');

  const vCheck = {
    // eslint-disable-next-line eqeqeq
    set: settings.fdv == fd.version,
    // eslint-disable-next-line eqeqeq
    snd: sounds.cfg.v == fd.version
  };

  debug.log('Settings v' + settings.fdv, 'Sounds v', sounds.cfg.v, 'Freedeck v' + fd.version);

  if (!vCheck.set || !vCheck.snd) {
    debug.log('Failed ver check, set:', vCheck.set, 'sound:', vCheck.snd);
    console.log(picocolors.red('[IMPORTANT!]\nFreedeck is out of sync with v' + fd.version + '\nAffected configs:'));
    if (!vCheck.set) console.log('- Settings');
    if (!vCheck.snd) console.log('- Sounds');
    console.log(picocolors.red('[IMPORTANT!] These configs will be updated and you will need to start Freedeck again.'));
    // Just reset them all llol
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${fd.version}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
    fs.writeFileSync('./Settings.js', `// Welcome to Freedeck internal settings! Here you can.. set.. settings!
// True for yes, false for no

const Settings = {
  UseAuthentication: ${settings.UseAuthentication}, // Turn on authentication (every session/restart will require password)
  // Your password is here, but in SHA-512!
  Password: '${createHash(settings.Password)}',
  LoginMessage: '${settings.LoginMessage}', // This message will show for users when they try to login (below "Login to (your name)'s Freedeck")
  YourName: '${settings.YourName}', // Shows alongside your login message,
  Port: ${settings.Port},

  // Don't touch!!!
  fdv: '${fd.version}'
};
module.exports = Settings;
`);
    process.exit(0);
  }

  const UPDATE_CHECK_TIME = new Date();
  debug.log(picocolors.blue('Update check finished in ' + (UPDATE_CHECK_TIME.getTime() - INIT_START_TIME.getTime()) + 'ms!') + ' (Relative to init start)', 'INIT');
}
