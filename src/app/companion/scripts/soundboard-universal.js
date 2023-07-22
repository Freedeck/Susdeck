/* eslint-disable no-undef */
Susaudio.init();

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
    document.querySelector('#now-playing').innerText = 'Playing: ' + Susaudio._player.listQueue.join(', ');
  }, 2);
}
