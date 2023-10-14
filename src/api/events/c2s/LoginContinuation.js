const Event = require('../Event');

const ev = new Event('c2sr_login_cont', ({ socket, args, loginList }) => {
  const sid = args[0];
  if (loginList.includes(sid)) {
    // Indeed it is the same user logging in.
    loginList.splice(loginList.indexOf(sid), 1);
    // Hello
    socket.emit('user_ack_cont');
    return { type: 'req_login_ack', data: sid };
  }
  socket.emit('user_ack_cont', 'session_expired');
  return { type: 'req_login_fail', data: sid };
});

module.exports = ev;
