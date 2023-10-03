const debug = require('../../../util/debug');
const Event = require('../Event');

const ev = new Event('c-connected', ({ socket }) => {
  debug.log('Companion is connected to server');
  delete require.cache[require.resolve('../../../settings/sounds.js')];
  const soundFile = require('../../../settings/sounds');
  socket.id = 'Companion';
  socket.emit('companion_info', soundFile.ScreenSaverActivationTime);
  return { type: 'companion_conn' };
});

module.exports = ev;
