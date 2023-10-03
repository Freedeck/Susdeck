const settings = require('../../../../Settings');

const Event = require('../Event');

const ev = new Event('c2sr_login', ({ socket, args, loginList }) => {
  const sid = args[0];
  if (settings.UseAuthentication === false) { socket.emit('session_valid'); loginList.push(sid); return { type: 'authoff' }; }
  // ID recieved, load into memory so we know it's the same user logging in.
  loginList.push(sid);
  socket.sid = sid;

  // We'll confirm that we want to take user to the login page.
  socket.emit('s2ca_login', '/assets/tools/login.html', settings.LoginMessage, settings.YourName);
  return { type: 'requested_login', data: sid };
});

module.exports = ev;
