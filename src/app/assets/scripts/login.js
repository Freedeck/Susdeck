/* eslint-disable no-undef */

universal.socket.on('server_connected', () => {
  loaded = true;
  universal.socket.emit('c2sr_login_cont', universal.load('temp_hwid'));
});

universal.socket.on('user_ack_cont', (status) => {
  if (status === 'session_expired') {
    universal.save('session', '');
    window.location.replace('../../index.html');
  }
  universal.sendToast('Loading login form..');
  document.querySelector('#loading').style.display = 'none';
  document.querySelector('#sdl').innerText = universal.load('login_msg');
  document.querySelector('#yn').innerText = universal.load('owner_name');
  document.querySelector('#login').style.display = 'block';
});

universal.socket.on('s2cs_login', (sessionID, g) => {
  // This session ID is actually kinda important
  universal.save('session', sessionID);
  window.location.href = g;
});

// eslint-disable-next-line no-unused-vars
const submit = () => {
  universal.sendToast('Logging you in..');
  universal.socket.emit('c2sd_login', [document.querySelector('#password').value, universal.load('temp_hwid')]);
};
