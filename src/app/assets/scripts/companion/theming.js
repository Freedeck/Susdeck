/* eslint-disable no-undef, no-unused-vars */
function setTheme (t) {
  susdeckUniversal.save('theme', t)
  susdeckUniversal.socket.emit('c-theme', t)
  setTimeout(() => {
    susdeckUniversal.socket.emit('reloadme') // Give the computer time to write theme.sd
  }, 50)
}
