/* eslint-disable no-unused-vars, no-undef */
if (keys !== document.querySelector('#keys')) keys = document.querySelector('#keys');
if (!Pages) Pages = {};
const q = [];
const countOnEachPage = 8;

const gsl = () => {
  // IMPL SOON
};

const volChanged = (isUs) => {
  let volumeSlider = document.querySelector('#out-vol');
  if (isUs) volumeSlider = document.querySelector('#out-volt');
  if (!isUs) Susaudio._player.volume = volumeSlider.value;
  if (isUs) Susaudio._player.NotVBVolume = volumeSlider.value;
  Susaudio._player.queue.forEach(audio => {
    if (!isUs) Susaudio._player.volume = volumeSlider.value;
    if (isUs) Susaudio._player.NotVBVolume = volumeSlider.value;
    if (!isUs) audio.volume = Susaudio._player.volume;
    if (isUs) {
      if (audio.isNotVB) audio.volume = Susaudio._player.NotVBVolume;
    }
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
