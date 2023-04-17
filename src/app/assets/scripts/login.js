/* eslint-disable no-undef */
const socket = io()

addToHTMLlog('Waiting for host to respond to login request continuation')
socket.on('server_connected', function () {
  addToHTMLlog('Connected to Susdeck host')
  loaded = true
  socket.emit('c2sr_login_cont', susdeckUniversal.load('sid'))
})
socket.on('user_ack_cont', function (status) {
  if (status === 'session_expired') {
    susdeckUniversal.save('session', '')
    window.location.replace('../../index.html')
  }
  addToHTMLlog('Loading login form..')
  document.getElementById('loading').style.display = 'none'
  document.getElementById('sdl').innerText = susdeckUniversal.load('login_msg')
  document.getElementById('yn').innerText = susdeckUniversal.load('owner_name')
  document.getElementById('login').style.display = 'block'
})

socket.on('session_invalid', function () {
  susdeckUniversal.save('session', '')
  window.location.replace('../index.html')
})

socket.on('s2cs_login', (sessionID, g) => {
  // This session ID is actually kinda important
  susdeckUniversal.save('session', sessionID)
  window.location.href = g
})

// eslint-disable-next-line no-unused-vars
function submit () {
  socket.emit('c2sd_login', document.getElementById('password').value)
}
