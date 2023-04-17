/* eslint-disable camelcase */
const Susaudio = {
  _player: {
    pitch: 1.0,
    preservesPitch: false,
    volume: 1.0,
    autotuned: false,
    paused: false,
    sinkId: null,
    timeSinceLastRequest: 0,
    queue: [],
    audioEndedCallback: function () {
      Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, this)
    }
  },
  init: async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    devices.forEach(device => {
      if (device.label === 'CABLE Input (VB-Audio Virtual Cable)' || device.label === 'Companion Soundboard In') {
        const audio = new Audio()
        audio.setSinkId(device.deviceId)
        Susaudio._player.sinkId = device.deviceId
      }
    })
  },
  playSound: async (audioSource, audioName, sa_isNotVB = false) => {
    if (Susaudio._player.timeSinceLastRequest < 2) return
    const audio = new Audio(audioSource)
    audio.preservesPitch = Susaudio._player.preservesPitch
    audio.playbackRate = Susaudio._player.pitch
    audio.volume = Susaudio._player.volume
    audio.isSusaudio = true
    audio.saName = audioName
    audio.isNotVB = sa_isNotVB
    if (audio.isNotVB === false) {
      await audio.setSinkId(Susaudio._player.sinkId)
      localStorage.setItem('_susaudio_playlist', localStorage.getItem('_susaudio_playlist') + ',' + audio.saName)
    }
    audio.play()
    audio.onended = Susaudio._player.audioEndedCallback
    Susaudio._player.queue.push(audio)
    Susaudio._player.timeSinceLastRequest = 0
  },
  clearPlaylist: function () {
    localStorage.setItem('_susaudio_playlist', '')
  },
  stopAll: () => {
    Susaudio._player.queue.forEach(audio => {
      audio.stop()
    })
  },
  stopRecent: () => {
    Susaudio._player.queue[0].stop()
    Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, Susaudio._player.queue[0])
  },
  playPause: () => {
    Susaudio._player.queue.forEach(audio => {
      if (Susaudio._player.paused === true) {
        audio.play()
        Susaudio._player.paused = !Susaudio._player.paused
      } else {
        audio.pause()
        Susaudio._player.paused = !Susaudio._player.paused
      }
    })
  },
  changeAllPlayingPitch: (num) => {
    Susaudio._player.queue.forEach(audio => {
      audio.pause()
      audio.preservesPitch = false
      audio.playbackRate = num
      audio.play()
    })
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

setInterval(() => {
  Susaudio._player.timeSinceLastRequest++
}, 1)
