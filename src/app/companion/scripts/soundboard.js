/* eslint-disable no-unused-vars, no-undef */
const keys = document.getElementById('keys');
const Pages = {};
const q = [];
const countOnEachPage = 8;

addToHTMLlog('Waiting for host...');
Susaudio.init();

susdeckUniversal.socket.on('server_connected', function () {
  removeFromHTMLlog('Waiting for host...');
  addToHTMLlog('Host connection established!');
  susdeckUniversal.socket.emit('companion_connected');
  setTimeout(() => {
    document.getElementById('console').style.display = 'none';
    if (susdeckUniversal.isInDebug === true) {
      // eslint-disable-next-line no-undef
      Sounds.forEach(function (s) {
        // eslint-disable-next-line no-undef
        document.getElementById('keys').innerHTML += `<div><h3>${s.name}</h3><h4>${soundDir + s.path}</h4></div>`;
      });
    }
  }, 1000);
});

setInterval(() => {
  q.splice(0, q.length);
  // eslint-disable-next-line no-undef
  Susaudio._player.queue.forEach(audio => {
    if (audio.isSusaudioFB) return;
    if (!audio.isNotVB) return;
    q.push(audio.saName);
  });
  document.getElementById('now-playing').innerText = 'Playing: ' + q.join(', ');
}, 250);

function volChanged () {
  const volumeSlider = document.getElementById('out-vol');
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.volume = volumeSlider.value;
    audio.volume = Susaudio._player.volume;
  });
}

function pbrChanged () {
  const volumeSlider = document.getElementById('out-pbr');
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.pitch = volumeSlider.value;
    audio.playbackRate = Susaudio._player.pitch;
  });
}

susdeckUniversal.socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll();
    return;
  }
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound, name);
  Susaudio.playSound(sound, name, true);
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] Playing ' + name);
});

function addToHTMLlog (text) {
  const txt = document.createElement('h2');
  txt.id = text;
  txt.innerText = text;
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] ' + text);
  document.getElementById('console').appendChild(txt);
}

function removeFromHTMLlog (text) {
  document.getElementById('console').removeChild(document.getElementById(text));
}
