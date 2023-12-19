/* eslint-disable no-undef */

universal.socket.on('server_connected', () => {
  loaded = true;
  universal.socket.emit('fd.c2s.login.loaded', universal.load('temp_hwid'));
});

universal.socket.on('fd.c2s.login.form', (status) => {
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

universal.socket.on('fd.c2s.login.valid', (sessionID, g) => {
  // This session ID is actually kinda important
  universal.save('session', sessionID);
  window.location.href = g;
});

// eslint-disable-next-line no-unused-vars
const submit = () => {
  universal.sendToast('Logging you in..');
  universal.socket.emit('fd.c2s.login.data', [document.querySelector('#password').value, universal.load('temp_hwid')]);
};
