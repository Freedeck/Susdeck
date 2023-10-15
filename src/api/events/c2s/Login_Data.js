const settings = require('../../../../Settings');
const { createHash } = require('../../../util/crypto');
const debug = require('../../../util/debug');

const Event = require('../Event');

const ev = new Event('fd.c2s.login.data', ({ socket, args }) => {
  const password = args[0];
  const hwid = args[1];
  debug.log('Recieved password request!');
  if (createHash(password) === settings.Password) {
    debug.log('Password is valid!');
    // Congratulations, now let's assign a session id.
    const sid = require('crypto').randomBytes(8).toString('hex');
    debug.log('Adding ' + sid + ' to session ids');
    socket.sessionID = sid;
    socket.twid = hwid;
    let path = '/';
    if (hwid.endsWith('cm')) path += 'companion';
    socket.emit('fd.c2s.login.valid', sid, path);
    return { type: 'validate_session', data: sid };
  } else {
    socket.emit('fd.c2s.login.incorrect_password');
    return { type: 'incorrect_password' };
  }
});

module.exports = ev;
