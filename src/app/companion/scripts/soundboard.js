/* eslint-disable no-unused-vars, no-undef */
if (keys !== document.querySelector('#keys')) keys = document.querySelector('#keys');
if (!Pages) Pages = {};
const q = [];
const countOnEachPage = 8;

const gsl = () => {
  // IMPL SOON
};

const volChanged = () => {
  const volumeSlider = document.querySelector('#out-vol');
  Susaudio._player.volume = volumeSlider.value;
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.volume = volumeSlider.value;
    audio.volume = Susaudio._player.volume;
  });
};

const pbrChanged = () => {
  const volumeSlider = document.querySelector('#out-pbr');
  Susaudio._player.pitch = volumeSlider.value;
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.pitch = volumeSlider.value;
    audio.playbackRate = Susaudio._player.pitch;
  });
};
