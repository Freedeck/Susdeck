const Event = require('../Event');

const ev = new Event('c-sort', ({ socket, args }) => {
  socket.emit('server_notification', 'asdcfv');
  console.log('sort')
  return { type: 'none' };
}, true);

module.exports = ev;
