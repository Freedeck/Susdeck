const evt = require('../eventNames');

module.exports = ({io, socket, data}) => {
  socket.sendNotif({sender: 'RPC', data: 'Authorize', incoming: data})
}; 