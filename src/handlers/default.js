const eventNames = require('./eventNames');
const cfg = require('../config.fd');

module.exports = {
    name: 'Main',
    id: 'fd.handlers.main',
    exec: ({socket}) => {
        socket.id = Math.random() * 2048 + '.fd';
        socket.tempLoginID = Math.random() * 1024 + '.tlid.fd';
        socket.on('disconnect', () => console.log('Client disconnected'));
        socket.on(eventNames.client_greet, (user) => {
            console.log('Client ' + user + ' has greeted server at ' + new Date());
            socket.emit(eventNames.information, JSON.stringify({ id: socket.id, tempLoginID: socket.tempLoginID, events: eventNames, cfg }));
        })
    }
}
