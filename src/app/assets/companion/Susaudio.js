/* eslint-disable camelcase */
const Susaudio = {
  _player: {
    pitch: 1.0,
    preservesPitch: true,
    autotuned: false,
    queue: []
  },
  playSound: (audioSource, audioName) => {
    const audio = new Audio(audioSource)
    audio.preservesPitch = Susaudio._player.preservesPitch
    audio.playbackRate = Susaudio._player.pitch
    audio.isSusaudio = true
    audio.saName = audioName
    audio.play()
    audio.onended = () => {
      Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, audio)
    }
    Susaudio._player.queue.push(audio)
  },
  stopAll: () => {
    Susaudio._player.queue.forEach(audio => {
      audio.stop()
    })
  },
  stopRecent: () => {
    Susaudio._player.queue[0].stop()
    Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, Susaudio._player.queue[0])
  }
}

Audio.prototype.stop = function () {
  if (!this.isSusaudio) { this.stop(); return }
  this.pause()
  this.currentTime = 0
  Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, this)
}
// other functions
function _sa_removeFromArray (arr, value) {
  return arr.filter(function (ele) {
    return ele !== value
  })
}
