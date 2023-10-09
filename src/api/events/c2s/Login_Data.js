const settings = require('../../../../Settings');
const { createHash } = require('../../../util/crypto');
const debug = require('../../../util/debug');

const Event = require('../Event');

const ev = new Event('c2sd_login', ({ socket, args }) => {
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
    socket.emit('s2cs_login', sid, path);
    return { type: 'validate_session', data: sid };
  } else {
    socket.emit('s2ca_incorrect_pass');
    return { type: 'incorrect_password' };
  }
});

module.exports = ev;
