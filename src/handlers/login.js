const eventNames = require('./eventNames');

module.exports = {
    name: 'Login',
    id: 'fd.handlers.login',
    exec: ({socket}) => {
        socket.on(eventNames.login_data, (data) => {
            if (data.tlid === socket.tempLoginID) {
                // yes
                socket.emit(eventNames.login_data_ack)
            }
        })
    }
}
