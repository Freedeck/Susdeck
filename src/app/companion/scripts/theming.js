/* eslint-disable no-undef, no-unused-vars */
function setTheme (t) {
  susdeckUniversal.save('theme', t)
  susdeckUniversal.socket.emit('c-theme', t)
  setTimeout(() => {
    susdeckUniversal.socket.emit('c-change')
  }, 200)
}
