const path = require('path');
const debug = require('../util/debug');
const fs = require('fs');
const rob = require('robotjs');
const sbc = require('../settings/sounds');
const set = require('../../Settings');
const pkg = require('../../package.json');
const picocolors = require('../util/picocolors');

const apiEvents = new Map();
const sockApiEvents = new Map();

const metadata = {
  fdVersion: pkg.version
};

const init = (io, app) => {
  const loginList = [];
  const sessions = [];

  debug.log('Adding socket events', 'SAPI');

  fs.readdirSync(path.join(__dirname, '/events')).forEach((file) => {
    if (file === 'Event.js') return;
    fs.readdirSync(path.join(__dirname, '/events/' + file)).forEach(cEvent => {
      const query = require(path.join(__dirname, '/events/' + file + '/' + cEvent));
      query.init();
    });
  });

  io.on('connection', (socket) => {
    // Give sockets a randomized ID
    socket.id = Math.random().toString().substring(2, 4) + require('crypto').randomBytes(8 + 2).toString('hex');
    debug.log('New connection - new socket ID generated: ' + socket.id);

    // Initial connection
    console.log(picocolors.green('Connected to client @ ' + new Date()));
    socket.emit('server_connected', set.UseAuthentication, require(path.resolve('./package.json')).version); // Send user confirmation: connected to server
    socket.emit('set-theme', fs.readFileSync(path.join(__dirname, '/persistent/theme.sd')).toString()); // Tell client to set the theme
    debug.log('Sent user connection success message', 'SAPI ID:' + socket.id);

    socket.on('keypress', (keyInput) => {
      if (set.UseAuthentication && !sessions.includes(socket.sid)) { socket.emit('session_invalid'); return; };
      if (keyInput === null) return;
      try {
        if (typeof keyInput !== 'object') keyInput = JSON.parse(keyInput);

        if (keyInput.keys) {
          let keys = [];
          keys = JSON.parse(keyInput.keys);
          keys.forEach((key) => {
            if (key === 'none' || key === '') return;
            rob.keyToggle(key, 'down');
            setTimeout(() => { // Add delay to mimic keyboard
              rob.keyToggle(key, 'up');
            }, 50);
          });
          return; // Only one!
        }

        if (keyInput.name === 'Stop All') { io.emit('press-sound', 'Stop All', 'Stop All'); return; }
        sbc.Sounds.forEach(sound => {
          if (sound.name === keyInput.name) {
            io.emit('press-sound', sbc.soundDir + sound.path, sound.name);
          }
        });
      } catch (error) {
        console.error(error.toString());
      }
    });
    socket.on('Authenticated', (sessionID) => {
      debug.log('Recieved ' + sessionID + ', checking against session list..');
      if (sessions.includes(sessionID) || set.UseAuthentication === false) {
        debug.log(sessionID + ' is valid!', 'SAPI Auth');
        if (set.UseAuthentication === false) {
          debug.log('Authentication is off, potentially unsecure client.', 'SAPI Auth');
          if (!sessions.includes(sessionID)) sessions.push(sessionID);
        }
        console.log(picocolors.green('Authenticated client @ ' + new Date()));
        socket.emit('session_valid');
        socket.sid = sessionID;
        if (!sessions.includes(sessionID)) loginList.push(sessionID);
      } else {
        debug.log(sessionID + ' is invalid, kicking out user..', 'SAPI ID:' + socket.id);
        socket.emit('session_invalid');
      }
    });
    sockApiEvents.forEach((event) => {
      try {
        socket.on(event.event, async (args) => {
          // if (event.event === 'c2sr_login') { socket.emit('session_valid'); }
          if (event.prot) {
            if (socket.sid === undefined || !sessions.includes(socket.sid)) { socket.emit('noauth'); return; }
          }
          debug.log(event.event + ' ran', 'SAPI ID:' + socket.id);
          if (event.async) {
            await event.callback({ socket, args, loginList, meta: metadata });
          } else {
            const callback = event.callback({ socket, args, loginList, meta: metadata });
            if (callback.type === 'companion_conn') {
              debug.log('Companion is connected to server.', 'SAPI');
              socket.companion = true;
            }
            if (callback.type === 'validate_session') {
              const person = callback.data;
              sessions.push(person);
            }
            if (callback.type === 'requested_login') {
              debug.log('User with TempHWID ' + callback.data + ' requested login.', 'SAPI Auth');
            }
            if (callback.type === 'req_login_ack') {
              debug.log('User with SID ' + callback.data + ' is allowed to use login form.', 'SAPI Auth');
            }
            if (callback.type === 'req_login_fail') {
              debug.log('User with SID ' + callback.data + ' is not allowed to use login form.', 'SAPI Auth');
            }
            if (callback.type === 'c-change') {
              io.emit('c-change');
            }
            if (callback.type === 'custom_theme') {
              const t = callback.data;
              io.emit('custom_theme', t);
            }
            if (callback.type === 'incorrect_password') {
              debug.log('Incorrect password', 'SAPI Auth');
            }
            if (callback.type === 'c-reset') {
              Object.keys(require.cache).forEach((key) => { delete require.cache[key]; });
              io.emit('c-reset');
            }
          }
        });
      } catch (err) {
        console.error(picocolors.bgRed('ERROR!') + err);
      }
    });
  });

  debug.log('Adding HTTP endpoints', 'SAPI');
  // Now HTTP debug methods
  fs.readdir(path.join(__dirname, '/routes'), (err, files) => {
    if (err) { throw new Error(err); }
    files.forEach(routefile => {
      const route = require(path.join(__dirname, '/routes/' + routefile));
      // type, route, exec
      // only get supported for now
      apiEvents.set(route.route, route);
      if (route.type === 'get') app.get('/api/' + route.route, (req, res) => route.exec(req, res));
      if (route.type === 'post') app.post('/api/' + route.route, (req, res) => route.exec(req, res));
    });
  });

  // Now, before exit
  // catching signals and do something before exit
  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit'
  ].forEach((sig) => {
    process.on(sig, () => {
      terminator(sig);
      debug.log('Signal received: ' + sig);
    });
  });

  const terminator = (sig) => {
    if (typeof sig === 'string') {
      // call your async task here and then call process.exit() after async task is done
      io.emit('server_shutdown');
      io.emit('server_notification', 'Server shutting down!');
    }
    console.log('Sent shutdown message to Freedeck client');

    setTimeout(() => { // give clients time to change page
      process.exit(0);
    }, 260);
  };
};

module.exports = { init, apiEvents, sockApiEvents };
