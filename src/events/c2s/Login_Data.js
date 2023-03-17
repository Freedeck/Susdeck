const settings = require('../../../Settings')
const debug = require('../../cliUtil')

module.exports = {
  event: 'c2sd_login',
  callback: (socket, args) => {
    const password = args[0]
    debug.log('Recieved password request!')
    if (password === settings.Password) {
      debug.log('Password is valid!')
      // Congratulations, now let's assign a session id.
      const sid = require('crypto').randomBytes(8).toString('hex')
      debug.log('Adding ' + sid + ' to session ids')
      socket.emit('s2cs_login', sid, '../../')
      return 'ValidateSession:' + sid
    }
  }
}
