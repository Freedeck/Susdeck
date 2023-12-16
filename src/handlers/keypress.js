const eventNames = require('./eventNames');
const debug = require('../utils/debug');
const cfg = require('../managers/settings').settings();

module.exports = {
  name: 'Keypress Handler',
  id: 'fd.handlers.keypress',
  exec: ({socket, types, plugins, io}) => {
    socket.on(eventNames.keypress, (ev) => {
      if (socket.auth !== true && cfg.useAuthentication) {
        socket.emit(eventNames.not_auth);
        return;
      }
      try {
        ev = JSON.parse(ev);
        if (ev.builtIn) {
          if (ev.data === 'stop-all') io.emit(eventNames.keypress, JSON.stringify({sound: {name: 'Stop All', type: 'fd.sound'}}));
          return;
        }
        if (!ev.event.isTrusted) {
          socket.emit(eventNames.not_trusted); return;
        }
        if (ev.btn.type === 'fd.sound') {
          // Handle sound stuff
          io.emit(eventNames.keypress, JSON.stringify(ev.btn));
        }
        if (types().get(ev.btn.type) || plugins().get(ev.btn.type)) {
          if (types().get(ev.btn.type)) {
            types().get(ev.btn.type).instance.onButton(ev.btn); return;
          }
          if (plugins().get(ev.btn.type)) {
            plugins().get(ev.btn.type).instance.onButton(ev.btn);
          }
        }
      } catch (e) {
        debug.log(e);
      }
    });
  },
};
