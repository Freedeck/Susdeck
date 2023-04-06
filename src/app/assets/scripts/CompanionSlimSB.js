/* eslint-disable no-undef */
socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll()
    return
  }
  Susaudio.playSound(sound, name)
  Susaudio.playSound(sound, name, true)
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] Playing ' + name)
})
