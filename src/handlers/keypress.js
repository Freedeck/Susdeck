const eventNames = require('./eventNames');
const cfg = require('../config.fd');

module.exports = {
    name: 'Keypress Handler',
    id: 'fd.handlers.keypress',
    exec: ({socket, plugins, io}) => {
        socket.on(eventNames.keypress, (ev) => {
            ev = JSON.parse(ev);
            if (!ev.event.isTrusted) { socket.emit(eventNames.not_trusted); return; }
            if (ev.btn.type === 'fd.sound') {
                console.log('sound')
                // Handle sound stuff
                io.emit(eventNames.keypress, JSON.stringify(ev.btn));
            }
        })
    }
}
