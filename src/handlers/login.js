const eventNames = require('./eventNames');
const sec = require('../configs/secrets.fd');

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
            const hashed = sec.hash(data.passwd);
            if (hashed === sec.password) {
                socket.emit(eventNames.login, true);
                socket.auth = true;
            } else {
                socket.emit(eventNames.login, false);
                socket.auth = true;
            }
        })
    }
}
