const Event = require('../Event');

const ev = new Event('c-connected', ({ socket }) => {
  delete require.cache[require.resolve('../../../settings/sounds.js')];
  const soundFile = require('../../../settings/sounds');
  socket.id = 'Companion';
  socket.emit('companion_info', soundFile.ScreenSaverActivationTime);
  return { type: 'companion_conn' };
});

module.exports = ev;
