/* eslint-disable no-unused-vars, no-undef */
const keys = document.getElementById('keys');
const Pages = {};
const q = [];
const countOnEachPage = 8;

addToHTMLlog('Waiting for host...');

universal.socket.on('server_connected', function () {
  removeFromHTMLlog('Waiting for host...');
  addToHTMLlog('Host connection established!');
  universal.socket.emit('companion_connected');
  setTimeout(() => {
    document.getElementById('console').style.display = 'none';
    if (universal.isInDebug === true) {
      Sounds.forEach(function (s) {
        document.getElementById('keys').innerHTML += `<div><h3>${s.name}</h3><h4>${soundDir + s.path}</h4></div>`;
      });
    }
  }, 1000);
});

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

function addToHTMLlog (text) {
  const txt = document.createElement('h2');
  txt.id = text;
  txt.innerText = text;
  universal.log('[COMPANIONSB] ' + text);
  document.getElementById('console').appendChild(txt);
}

function removeFromHTMLlog (text) {
  document.getElementById('console').removeChild(document.getElementById(text));
}
