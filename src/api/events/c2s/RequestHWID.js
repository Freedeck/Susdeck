const { createHash } = require('../../../util/crypto');
const Event = require('../Event');

const ev = new Event('c2s_hashsock', ({ socket, args, loginList }) => {
  const hash = createHash(socket + new Date().getTime());
  socket.emit('c2s_hashsock', hash);
  return { type: 'hwid', data: hash };
});

module.exports = ev;
