module.exports = {
  event: 'c2sr_login_cont',
  callback: (socket, args, loginList) => {
    const sid = args[0]
    console.log(sid)
    if (loginList.includes(sid)) {
      // Indeed it is the same user logging in.
      loginList.splice(loginList.indexOf(sid), 1)
      // Hello
      socket.emit('hiuser')
      return 'User ' + sid + ' is continuing login'
    }
    socket.emit('hiuser', 'uhhhlol')
    return 'No continue login'
  }
}
