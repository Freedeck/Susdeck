/* eslint-disable no-undef */
const soundQueue = [];

await Susaudio.init();

/* eslint-disable no-undef */
universal.socket.on('press-sound', (sound, name) => {
  if (name.includes('Stop All')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll();
    // Just in case
    name = '';
    sound = '';
    return;
  }
  universal.log('Soundboard', `Playing ${name}`);
  Susaudio.playSound(sound, name);
  Susaudio.playSound(sound, name, true);
});

if (typeof document.querySelector('#now-playing') !== 'undefined') {
  setInterval(() => {
    soundQueue.splice(0, soundQueue.length);
    // eslint-disable-next-line no-undef
    Susaudio._player.queue.forEach(audio => {
      if (audio.isSusaudioFB) return;
      if (!audio.isNotVB) return;
      soundQueue.push(audio.saName);
    });
    document.querySelector('#now-playing').innerText = 'Playing: ' + soundQueue.join(', ');
  }, 2);
}
