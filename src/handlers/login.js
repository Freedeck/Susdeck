const eventNames = require('./eventNames');
const sec = require('../loaders/secretManager');

module.exports = {
    name: 'Login',
    id: 'fd.handlers.login',
    exec: ({socket}) => {
        socket.on(eventNames.login_data, (data) => {
            if (data.tlid === socket.tempLoginID) {
                // yes
                socket.emit(eventNames.login_data_ack, true);
                socket.tlidMatch = true;
            } else {
                socket.emit(eventNames.login_data_ack, false);
                socket.tlidMatch = false;
            }
        })
        socket.on(eventNames.login, (data) => {
            if (!socket.tlidMatch) {
                socket.emit(eventNames.not_match);
                return;
            }
            if (sec.match('password', data.passwd)) {
                socket.emit(eventNames.login, true);
                socket.auth = true;
            } else {
                socket.emit(eventNames.login, false);
                socket.auth = false;
            }
        })
    }
}
