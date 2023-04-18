const soundQueue = [];

/* eslint-disable no-undef */
susdeckUniversal.socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll();
    return;
  }
  Susaudio.playSound(sound, name);
  Susaudio.playSound(sound, name, true);
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] Playing ' + name);
});

if (typeof document.getElementById('now-playing') !== 'undefined') {
  setInterval(() => {
    soundQueue.splice(0, soundQueue.length);
    // eslint-disable-next-line no-undef
    Susaudio._player.queue.forEach(audio => {
      if (audio.isSusaudioFB) return;
      if (!audio.isNotVB) return;
      soundQueue.push(audio.saName);
    });
    document.getElementById('now-playing').innerText = 'Playing: ' + soundQueue.join(', ');
  }, 250);
}
