const eventNames = require('./eventNames');
const cfg = require('../config.fd');

module.exports = {
    name: 'Keypresses',
    id: 'fd.handlers.keypress',
    exec: ({socket, plugins}) => {
        socket.on(eventNames.keypress, (ev) => {
            ev = JSON.parse(ev);
            if (!ev.event.isTrusted) { socket.emit(eventNames.not_trusted); return; }
            if (ev.btn.type === 'fd.sound') {
                // Handle sound stuff
                socket.emit(eventNames.keypress)
            }
        })
    }
}
