const settings = require('../../../../Settings');
const debug = require('../../../util/debug');

const Event = require('../Event');

const ev = new Event('c2sd_login', (socket, args) => {
  const password = args;
  debug.log('Recieved password request!');
  if (password === settings.Password) {
    debug.log('Password is valid!');
    // Congratulations, now let's assign a session id.
    const sid = require('crypto').randomBytes(8).toString('hex');
    debug.log('Adding ' + sid + ' to session ids');
    socket.sessionID = sid;
    socket.emit('s2cs_login', sid, '../../');
    return 'ValidateSession:' + sid;
  } else {
    socket.emit('s2ca_incorrect_pass');
  }
});

module.exports = ev;
