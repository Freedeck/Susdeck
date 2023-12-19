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
const plugins = new Map();
const notificationQueue = [];
const pluginsFiltered = new Map();

const metadata = {
  fdVersion: pkg.version
};

const init = (io, app) => {
  const loginList = [];
  const sessions = [];
  const connections = [];

  debug.log('Adding socket events', 'SAPI');
  const SAPI_INIT_START = new Date();

  fs.readdirSync(path.join(__dirname, '/events')).forEach((file) => {
    if (file === 'Event.js') return;
    fs.readdirSync(path.join(__dirname, '/events/' + file)).forEach(cEvent => {
      const query = require(path.join(__dirname, '/events/' + file + '/' + cEvent));
      query.init();
    });
  });

  const SAPI_EVENT_ADD = new Date();
  debug.log(picocolors.blue('SAPI events added in ' + (SAPI_EVENT_ADD.getTime() - SAPI_INIT_START.getTime()) + 'ms!') + ' (Relative to SAPI init)', 'INIT');

  fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
    if (!file.endsWith('.fdp.js')) return;
    const Query = require(path.resolve('./plugins/' + file));
    const plugin = new Query();
    plugin.init();
  });

  const SAPI_PLUG_ADD = new Date();
  debug.log(picocolors.blue('SAPI plugins added in ' + (SAPI_PLUG_ADD.getTime() - SAPI_INIT_START.getTime()) + 'ms!') + ' (Relative to SAPI init)', 'INIT');

  io.on('connection', (socket) => {
    // Give sockets a randomized ID
    socket.id = Math.random().toString().substring(2, 4) + require('crypto').randomBytes(8 + 2).toString('hex');
    socket.conn = new Date().getTime();
    debug.log('New connection - new socket ID generated: ' + socket.id);
    connections.push(socket);

    // Initial connection
    console.log(picocolors.green('Connected to client @ ' + new Date()));
    socket.emit('server_connected', set.UseAuthentication, require(path.resolve('./package.json')).version); // Send user confirmation: connected to server
    socket.emit('plugins', Array.from(pluginsFiltered));
    socket.emit('plugins-origins', Array.from(plugins));
    socket.emit('set-theme', fs.readFileSync(path.join(__dirname, '/persistent/theme.sd')).toString()); // Tell client to set the theme
    debug.log('Sent user connection success message', 'SAPI ID:' + socket.id);

    setInterval(() => {
      notificationQueue.forEach(notification => {
        io.emit('server_notification', notification);
        notificationQueue.splice(notificationQueue.indexOf(notification), 1);
      });
    }, 20);

    socket.on('keypress', (keyInput) => {
      if (set.UseAuthentication && !sessions.includes(socket.sid)) { socket.emit('session_invalid'); return; }
      if (keyInput === null) return;
      try {
        if (typeof keyInput !== 'object') keyInput = JSON.parse(keyInput);
        if (keyInput.type !== 'CA-Custom' || keyInput.type !== 'built-in') {
          if (pluginsFiltered.get(keyInput.type) && pluginsFiltered.get(keyInput.type).FDPlugin.disabled === false) {
            const plugin = pluginsFiltered.get(keyInput.type).FDPlugin;
            const callback = plugin.hookKey(sbc, keyInput);
            debug.log(keyInput.type + ' ran', 'SAPI ID:' + socket.id);
            try {
              doCallbacks(callback, socket, io);
            } catch (err) {
              console.error(err);
            }
            return;
          }
        }
        if (keyInput.keys) {
          const keys = JSON.parse(keyInput.keys);
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
          if (event.prot) {
            if (socket.sid === undefined || !sessions.includes(socket.sid)) { socket.emit('noauth'); return; }
          }
          debug.log(event.event + ' ran', 'SAPI ID:' + socket.id);
          if (event.async) {
            await event.callback({ socket, args, loginList, meta: metadata });
          } else {
            const callback = event.callback({ socket, args, loginList, meta: metadata });
            if (!callback) return;
            try {
              doCallbacks(callback, socket, io);
            } catch (err) {
              console.error(err);
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
  fs.readdirSync(path.join(__dirname, '/routes')).forEach(routefile => {
    const route = require(path.join(__dirname, '/routes/' + routefile));
    // type, route, exec
    // only get supported for now
    apiEvents.set(route.route, route);
  });
  apiEvents.forEach(ev => {
    if (ev.type === 'get') app.get('/api/' + ev.route, (req, res) => ev.exec(req, res));
    if (ev.type === 'post') app.post('/api/' + ev.route, (req, res) => ev.exec(req, res));
    debug.log(ev.route + ' | Endpoint added', 'HTTP');
  });
  const SAPI_HTTP_ADD = new Date();
  debug.log(picocolors.blue('HTTP endpoints added in ' + (SAPI_HTTP_ADD.getTime() - SAPI_INIT_START.getTime()) + 'ms!') + ' (Relative to SAPI init)', 'INIT');

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

  const doCallbacks = (callback, socket, io) => {
    if (callback.type === 'companion_conn') {
      debug.log('Companion is connected to server.', 'SAPI ID: ' + socket.id);
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
    if (callback.type === 'change') {
      io.emit('fd.companion.change');
    }
    if (callback.type === 'change-ex') {
      connections.forEach(sock => {
        if (sock === callback.data) return;
        sock.emit('fd.companion.change');
      });
    }
    if (callback.type === 'set-ico') {
      io.emit('fd.companion.set-ico', callback.data);
    }
    if (callback.type === 'redir') {
      socket.emit('redir', callback.data);
    }
    if (callback.type === 'custom_theme') {
      const t = callback.data;
      io.emit('custom_theme', t);
    }
    if (callback.type === 'incorrect_password') {
      debug.log('Incorrect password', 'SAPI Auth');
    }
    if (callback.type === 'reset') {
      fs.writeFileSync(path.resolve('./src/api/persistent/theme.sd'), 'Default');
      Object.keys(require.cache).forEach((key) => { delete require.cache[key]; });
      io.emit('fd.companion.reset');
    }
  }

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
  const SAPI_INIT_END = new Date();
  debug.log(picocolors.blue('SAPI initialized in ' + (SAPI_INIT_END.getTime() - SAPI_INIT_START.getTime()) + 'ms!'), 'INIT');
};

module.exports = { init, apiEvents, sockApiEvents, plugins, pluginsFiltered, notificationQueue };
