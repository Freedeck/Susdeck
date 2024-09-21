const UAE = {
	_nowPlaying: [[], [], []],
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
				audio.currentTime = audio.duration;
				await audio.play();
				universal.audioClient._end({ target: audio });
				audio.remove();
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
    universal.CLU("Boot / UAE", "Initializing audio engine");
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
        universal.CLU("Boot / UAE", "Created monitor potential devices");
      }
    }
    if (universal.load("vb.sink"))
      universal.audioClient._player.sink = universal.load("vb.sink");
    universal.CLU("Boot / UAE", "Loaded vb.sink");
    if (universal.load("monitor.sink"))
      universal.audioClient._player.monitorSink =
        universal.load("monitor.sink");
    else universal.audioClient._player.monitorSink = "default";
    universal.CLU("Boot / UAE", "Loaded monitor.sink");
  },
	play: async ({
		file,
		name,
		isMonitor = false,
		stopPrevious = false,
		volume = universal.load("vol") || 1,
		channel = isMonitor
			? universal.audioClient.channels.monitor
			: universal.audioClient.channels.cable,
	}) => {
		const ch = universal.audioClient.channels;
		const channelSelected = ch[channel];
		const audioInstance = document.createElement("audio");
		audioInstance.src = file;
		audioInstance.load();

		if (universal.audioClient._player.sink !== 0) {
			navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			await audioInstance.setSinkId(universal.audioClient._player.sink);
		}
		audioInstance.setAttribute("data-name", name);
		audioInstance.setAttribute("data-channel", channel);

		if (channelSelected === ch.monitor) {
			navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			await audioInstance.setSinkId(universal.audioClient._player.monitorSink);
			if (universal.load("monitor.sink")) {
				navigator.mediaDevices.getUserMedia({ audio: true, video: false });
				await audioInstance.setSinkId(universal.load("monitor.sink"));
			}
			audioInstance.volume = universal.audioClient._player.monitorVol;
		} else {
			audioInstance.volume = universal.audioClient._player.normalVol;
		}
		if (universal.load("pitch")) {
			audioInstance.playbackRate = universal.load("pitch");
		}

		audioInstance.volume = volume;
		audioInstance.preservesPitch = false;

		audioInstance.dataset.name = name;
		audioInstance.dataset.monitoring = isMonitor;

		if (stopPrevious === "stop_prev") {
			for (const audio of universal.audioClient._nowPlaying) {
				try {
					if (audio.dataset.name === audioInstance.dataset.name) {
						await audio.pause();
						audio.currentTime = audio.duration;
						await audio.play();
						audio.remove();
					}
				} catch (err) {
					// "waah waah waah noo you cant just abuse audio api" -companion
					// > i dont care :trole:
				}
			}
		}
		await audioInstance.play();

		audioInstance.onended = (ev) => {
			universal.sendEvent("audio-end", { audioInstance, name, isMonitor });
			universal.audioClient._end(ev);
			audioInstance.remove();
		};

		universal.audioClient._nowPlaying.push(audioInstance);
		universal.sendEvent("now-playing", { audioInstance, name, isMonitor });
		universal.updatePlaying();
		document.body.appendChild(audioInstance);
		return audioInstance;
	},
};

export default UAE;
