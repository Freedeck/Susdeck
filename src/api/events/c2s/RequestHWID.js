const { createHash } = require('../../../util/crypto');
const Event = require('../Event');

const ev = new Event('fd.c2s.hashsock', ({ socket, args, loginList }) => {
  const hash = createHash(socket + new Date().getTime());
  socket.emit('fd.c2s.hashsock', hash);
  return { type: 'hwid', data: hash };
});

module.exports = ev;
