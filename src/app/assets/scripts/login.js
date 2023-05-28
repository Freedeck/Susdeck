/* eslint-disable no-undef */

addToHTMLlog('Waiting for host to respond to login request continuation');
universal.socket.on('server_connected', function () {
  addToHTMLlog('Connected to Freedeck host');
  loaded = true;
  universal.socket.emit('c2sr_login_cont', universal.load('sid'));
});

universal.socket.on('s2ca_incorrect_pass', function () {
  universal.sendToast('Incorrect password!');
});

universal.socket.on('user_ack_cont', function (status) {
  if (status === 'session_expired') {
    universal.save('session', '');
    window.location.replace('../../index.html');
  }
  addToHTMLlog('Loading login form..');
  document.getElementById('loading').style.display = 'none';
  document.getElementById('sdl').innerText = universal.load('login_msg');
  document.getElementById('yn').innerText = universal.load('owner_name');
  document.getElementById('login').style.display = 'block';
});

universal.socket.on('session_invalid', function () {
  universal.save('session', '');
  window.location.replace('../index.html');
});

universal.socket.on('s2cs_login', (sessionID, g) => {
  // This session ID is actually kinda important
  universal.save('session', sessionID);
  window.location.href = g;
});

// eslint-disable-next-line no-unused-vars
function submit () {
  universal.sendToast('Logging you in..');
  universal.socket.emit('c2sd_login', document.getElementById('password').value);
}
