const UAE = {
	_nowPlaying: [],
	_end: (event) => {
		universal.audioClient._nowPlaying.splice(
			universal.audioClient._nowPlaying.indexOf(event.target),
			1,
		);
		universal.updatePlaying();
	},
	_player: {
		sink: 0,
		monitorPotential: [],
		monitorSink: "default",
		recsink: 0,
		normalVol: 1,
		monitorVol: 1,
		pitch: 1,
	},
	stopAll: async () => {
		for (const audio of universal.audioClient._nowPlaying) {
			try {
				await audio.pause();
			} catch (err) {
				// "waah waah waah noo you cant just abuse audio api" -companion
				// > i dont care :trole:
			}
		}
	},
	setPitch: (pitch) => {
		universal.audioClient._player.pitch = pitch;
		for (const audio of universal.audioClient._nowPlaying) {
			audio.playbackRate = pitch;
		}
		universal.save("pitch", pitch);
	},
	setVolume: (vol) => {
		universal.audioClient._player.normalVol = vol;
		for (const audio of universal.audioClient._nowPlaying) {
			audio.volume = vol;
		}
		universal.save("vol", vol);
	},
	channels: {
		cable: 0,
		monitor: 1,
		ui: 2,
	},
	sinks: [],
	initialize: () => {
    universal.CLU("Boot / Universal:AudioEngine", "Initializing audio engine");
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      const devices = [];
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) =>
          devices.filter((device) => device.kind === "audiooutput"),
        )
        .catch((err) => {
          console.error(err);
        });
      for (const device of devices) {
        universal.audioClient._player.monitorPotential.push(device);
        universal.CLU("Boot / Universal:AudioEngine", "Created monitor potential devices");
      }
    }
    if (universal.load("vb.sink"))
      universal.audioClient._player.sink = universal.load("vb.sink");
    universal.CLU("Boot / Universal:AudioEngine", "Loaded vb.sink");
    if (universal.load("monitor.sink"))
      universal.audioClient._player.monitorSink =
        universal.load("monitor.sink");
    else universal.audioClient._player.monitorSink = "default";
    universal.CLU("Boot / Universal:AudioEngine", "Loaded monitor.sink");
  },
	play: async ({
		file,
		name,
		stopPrevious = universal.load("playback-mode") === "stop_prev",
		volume = universal.load("vol") || 1,
		pitch = universal.load("pitch") || 1,
		channel,
	}) => {
		const ch = universal.audioClient.channels;
		const audioInstance = new Audio();
		audioInstance.src = file;
		audioInstance.load();

		if (channel === ch.monitor || channel === ch.ui) {
			await UAE.useSinkIfExists(audioInstance, "monitor.sink", universal.audioClient._player.monitorSink)
			audioInstance.volume = universal.audioClient._player.monitorVol;
		} else {
			await UAE.useSinkIfExists(audioInstance, "vb.sink", universal.audioClient._player.sink)
			audioInstance.volume = universal.audioClient._player.normalVol;
		}

		audioInstance.playbackRate = pitch;
		audioInstance.volume = volume;
		audioInstance.preservesPitch = false;

		audioInstance.dataset.name = name;
		audioInstance.dataset.channel = channel;
		audioInstance.dataset.monitoring = channel === ch.monitor;

		if (stopPrevious === true && channel !== ch.ui) {
			for (const audio of universal.audioClient._nowPlaying) {
				try {
					if (audio.dataset.name === name && audio.dataset.channel === channel.toString()) {
						await audio.pause();
					}
				} catch (err) {
					// "waah waah waah noo you cant just abuse audio api" -companion
					// > i dont care :trole:
				}
			}
		}

		audioInstance.play();

		audioInstance.onpause = (ev) => {
			universal.sendEvent("audio-end", { audioInstance, name, channel });
			universal.audioClient._end(ev);
			audioInstance.remove();
		};

		universal.audioClient._nowPlaying.push(audioInstance);
		universal.sendEvent("now-playing", { audioInstance, name, channel });
		universal.updatePlaying();
		return audioInstance;
	},
	useSinkIfExists: async (audioElem, sink, local) => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false });

		if (universal.load(sink))
			await audioElem.setSinkId(universal.load(sink)); 
		else
			await audioElem.setSinkId(local);
	}
};

export default UAE;
