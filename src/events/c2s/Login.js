const settings = require('../../../Settings')

module.exports = {
  event: 'c2sr_login',
  callback: (socket, args, loginList) => {
    const sid = args[0]
    if (!settings.UseAuthentication) { socket.emit('greenlight'); return }
    // ID recieved, load into memory so we know it's the same user logging in.
    loginList.push(sid)

    // We'll confirm that we want to take user to the login page.
    socket.emit('s2ca_login', 'assets/tools/login.html', settings.LoginMessage, settings.YourName)
    return 'User ' + sid + ' requested login!'
  }
}
