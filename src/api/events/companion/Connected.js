const debug = require('../../../util/debug');

module.exports = {
  event: 'c-connected',
  callback: (socket, args) => {
    debug.log('Companion is connected to server');
    delete require.cache[require.resolve('../../../settings/sounds.js')];
    const soundFile = require('../../../settings/sounds');
    socket.id = 'Companion';
    socket.emit('companion_info', soundFile.ScreenSaverActivationTime, soundFile.SoundOnPress);
  }
};
