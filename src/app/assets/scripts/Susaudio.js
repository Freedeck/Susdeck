/* eslint-disable no-undef */
/* eslint-disable camelcase */
const Susaudio = {
  _player: {
    pitch: 1.0,
    preservesPitch: false,
    volume: 1.0,
    autotuned: false,
    paused: false,
    sinkId: universal.load('susaudio_sinkid') ? universal.load('susaudio_sinkid') : null,
    timeSinceLastRequest: 0,
    queue: [],
    listQueue: [],
    devicesList: [],
    audioEndedCallback: (aud) => {
      Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, aud);
    }
  },
  listAudioDevices: () => {
    if (document.title !== 'Freedeck: Companion - Home') return;
    for (let i = 0; i < sai.options.length; i++) {
      document.querySelector('#sai').options.remove(i);
    }
    Susaudio._player.devicesList.forEach(device => {
      const option = document.createElement('option');
      option.value = device.name;
      option.innerText = device.name;
      option.setAttribute('data-sai-id', device.id);
      document.querySelector('#sai').appendChild(option);
      if (Susaudio._player.sinkId === device.id) option.selected = true;
    });
    document.querySelector('#sai').onchange = (ev) => {
      Susaudio.setSink(document.querySelector('#sai').options[document.querySelector('#sai').selectedIndex].getAttribute('data-sai-id'));
      universal.log('Susaudio', 'Changed sink');
    };
  },
  init: async () => {
    Susaudio._player.devicesList = [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach(device => {
      if (device.kind === 'audiooutput') Susaudio._player.devicesList.push({ name: device.label, id: device.deviceId });
      if (device.label === 'CABLE Input (VB-Audio Virtual Cable)') {
        const audio = new Audio();
        audio.setSinkId(device.deviceId); // Create a new audio to set permission to use sink
        if (universal.load('susaudio_sinkid')) return;
        Susaudio._player.sinkId = device.deviceId;
      }
    });
    if (document.querySelector('#sai')) Susaudio.listAudioDevices();
  },
  setSink: async (sinkId) => {
    const audio = new Audio();
    audio.setSinkId(sinkId); // Create a new audio to set permission to use sink
    Susaudio._player.sinkId = sinkId; // Set global sink ID
    universal.save('susaudio_sinkid', sinkId);
  },
  playSound: async (audioSource, audioName, sa_isNotVB = false) => {
    if (Susaudio._player.timeSinceLastRequest < 2) return; // Make sure we haven't just tried to make a request in the last 2ms
    const audio = new Audio(audioSource); // Create a new audio object
    // Setup all Susaudio params
    audio.preservesPitch = Susaudio._player.preservesPitch;
    audio.playbackRate = Susaudio._player.pitch;
    audio.volume = Susaudio._player.volume;
    audio.isSusaudio = true;
    audio.saName = audioName;
    audio.isNotVB = sa_isNotVB;
    // Check for if this is loopback to user speakers
    if (audio.isNotVB === false) {
      await audio.setSinkId(Susaudio._player.sinkId);
      universal.save('susaudio_playlist', universal.load('_susaudio_playlist') + ',' + audio.saName);
    }
    audio.onended = () => Susaudio._player.audioEndedCallback(audio);
    audio.play();
    Susaudio._player.queue.push(audio); // Add this to the queue
    Susaudio._player.timeSinceLastRequest = 0; // Reset time since last request
    if (sa_isNotVB) return;
    if (!audio.isNotVB) return;
    Susaudio._player.listQueue.push(audio.saName);
  },
  clearPlaylist: () => {
    universal.save('susaudio_playlist', '');
  },
  stopAll: () => {
    Susaudio._player.queue.forEach(audio => {
      stopAudio(audio);
    });
  },
  stopRecent: () => {
    stopAudio(Susaudio._player.queue[0]);
    Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, Susaudio._player.queue[0]);
  },
  playPause: () => {
    Susaudio._player.queue.forEach(audio => {
      if (Susaudio._player.paused === true) {
        audio.play();
        Susaudio._player.paused = !Susaudio._player.paused;
      } else {
        audio.pause();
        Susaudio._player.paused = !Susaudio._player.paused;
      }
    });
  },
  changeAllPlayingPitch: (num) => {
    Susaudio._player.queue.forEach(audio => {
      audio.preservesPitch = false; // Change it real quick
      audio.playbackRate = num;
    });
  }
};

stopAudio = (audio) => {
  Susaudio._player.queue = _sa_removeFromArray(Susaudio._player.queue, audio);
  audio.pause();
  audio.currentTime = 0;
};
// other functions
const _sa_removeFromArray = (arr, value) => {
  return arr.filter((ele) => {
    return ele !== value; // Filter out
  });
}

setInterval(() => {
  Susaudio._player.timeSinceLastRequest++;
  Susaudio._player.listQueue.splice(0, Susaudio._player.listQueue.length);
  Susaudio._player.queue.forEach(audio => {
    if (audio.isSusaudioFB) return;
    if (!audio.isNotVB) return;
    Susaudio._player.listQueue.push(audio.saName);
  });
  if (Susaudio._player.autotuned) {
    Susaudio.changeAllPlayingPitch(Math.floor(Math.random() * (2 - 1 + 1)) + 1);
  }
}, 1);
