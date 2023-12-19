const Event = require('../Event');

const ev = new Event('fd.c2s.login.loaded', ({ socket, args, loginList }) => {
  const sid = args[0];
  if (loginList.includes(sid)) {
    // Indeed it is the same user logging in.
    loginList.splice(loginList.indexOf(sid), 1);
    // Hello
    socket.emit('fd.c2s.login.form');
    return { type: 'req_login_ack', data: sid };
  }
  socket.emit('fd.c2s.login.form', 'session_expired');
  return { type: 'req_login_fail', data: sid };
});

module.exports = ev;
