const path = require('path');
const debug = require('../util/debug');
const fs = require('fs');
const rob = require('robotjs');
const sbc = require('../settings/sounds');

const apiEvents = new Map();
const sockApiEvents = new Map();

const init = (io, app) => {
  const loginList = [];
  const sessions = [];

  debug.log('Adding events to API');

  fs.readdirSync(path.join(__dirname, '/events')).forEach(function (file) {
    if (file === 'Event.js') return;
    fs.readdirSync(path.join(__dirname, '/events/' + file)).forEach(cEvent => {
      const query = require(path.join(__dirname, '/events/' + file + '/' + cEvent));
      query.init();
      debug.log('Added ' + file + ' event ' + query.event + ' from file ' + cEvent);
    });
  });

  io.on('connection', function (socket) {
    // Give sockets a randomized ID
    socket.id = Math.random().toString().substring(2, 4) + require('crypto').randomBytes(8 + 2).toString('hex');
    debug.log('Socket ID generated: ' + socket.id);

    // Initial connection
    console.log('Connected to client @ ' + new Date());
    setTimeout(function () {
      socket.emit('server_connected'); // Send user confirmation: connected to server
      socket.emit('set-theme', fs.readFileSync(path.join(__dirname, '/persistent/theme.sd')).toString()); // Tell client to set the theme
      debug.log('Sent user connection success message');
    }, 150);

    socket.on('keypress', function (keyInput) {
      debug.log(JSON.stringify(keyInput));
      if (keyInput.name) {
        if (keyInput.name === 'Stop All') io.emit('press-sound', 'Stop All', 'Stop All');
        sbc.Sounds.forEach(sound => {
          if (sound.name === keyInput.name) {
            io.emit('press-sound', sbc.soundDir + sound.path, sound.name);
          }
        });
        return;
      }
      let keys = [];
      if (keyInput.keys) keys = JSON.parse(keyInput.keys);
      keys.forEach(function (key) {
        key = key.split('}')[0];
        rob.keyToggle(key, 'down');
        setTimeout(function () {
          rob.keyToggle(key, 'up');
        }, 50);
      });
    });
    socket.on('Authenticated', function (sessionID) {
      debug.log('Recieved ' + sessionID + ', checking against session list..');
      if (sessions.includes(sessionID)) {
        debug.log(sessionID + ' is valid!');
        console.log('Authenticated client @ ' + new Date());
        socket.emit('session_valid');
      } else {
        debug.log(sessionID + ' is invalid, kicking out user..');
        socket.emit('session_invalid');
      }
    });
    sockApiEvents.forEach(function (event) {
      socket.on(event.event, async function (args) {
        debug.log(event.event + ' ran');
        if (event.async) {
          await event.callback(socket, args, loginList);
        } else {
          const callback = event.callback(socket, args, loginList);
          if (!callback || typeof callback !== 'string') { return; }
          if (callback.startsWith('ValidateSession:')) {
            const person = callback.split(':')[1];
            sessions.push(person);
          }
          if (callback.startsWith('c-change')) {
            io.emit('c-change');
          }
          if (callback.startsWith('custom_theme=')) {
            const t = callback.split('=')[1];
            io.emit('custom_theme', t);
          }
        }
      });
    });
  });

  // Now HTTP debug methods
  fs.readdir(path.join(__dirname, '/routes'), (err, files) => {
    if (err) { throw new Error(err); }
    files.forEach(routefile => {
      const route = require(path.join(__dirname, '/routes/' + routefile));
      // type, route, exec
      // only get supported for now
      if (route.type === 'get') {
        apiEvents.set(route.route, route);
        app.get('/api/' + route.route, (req, res) => route.exec(req, res));
      }
    });
  });

  // Now, before exit
  // catching signals and do something before exit
  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit'
  ].forEach(function (sig) {
    process.on(sig, function () {
      terminator(sig);
      console.log('signal: ' + sig);
    });
  });

  function terminator (sig) {
    if (typeof sig === 'string') {
      // call your async task here and then call process.exit() after async task is done
      io.emit('server_shutdown');
    }
    console.log('Sent shutdown message to Susdeck client');

    // give clients time to change page
    setTimeout(() => {
      process.exit(0);
    }, 250);
  }
};

module.exports = { init, apiEvents, sockApiEvents };
