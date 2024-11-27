const eventNames = require('../eventNames');
const { nbws } = require('./internalNBWSHandler');

module.exports = ({ socket, data }) => {
  nbws.on(data, (...reply) => {
    socket.emit(eventNames.nbws.reply, [data, reply]);
  })
}