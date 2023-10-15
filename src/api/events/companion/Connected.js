const Event = require('../Event');

const ev = new Event('fd.companion.connected', ({ socket }) => {
  delete require.cache[require.resolve('../../../settings/sounds.js')];
  const soundFile = require('../../../settings/sounds');
  socket.id = Math.random().toString().substring(2, 4) + require('crypto').randomBytes(8 + 2).toString('hex') + 'cm';
  socket.emit('companion_info', soundFile.ScreenSaverActivationTime, socket.id);
  return { type: 'companion_conn' };
});

module.exports = ev;
