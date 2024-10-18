import { SidebarSection, SidebarSlider, SidebarButton, SidebarSelect } from "../SidebarSection";

const style = new SidebarSection("Soundboard", "Soundboard");

style.children.push({build:()=>{
  const d = document.createElement("div");
  d.id = "np-sb";
  return d;
}})

universal.listenFor("now-playing", (data) => {
	const { name, channel } = data;
	if (
		channel === universal.audioClient.channels.ui ||
		channel === universal.audioClient.channels.monitor
	)
		return;
	const newEle = document.createElement("div");
	const filname = name.replace(/[^a-zA-Z0-9]/g, "");
	newEle.className = `np s-${filname}`;
	newEle.innerText = name;
	document.querySelector("#np-sb").appendChild(newEle);
});

style.children.push(new SidebarButton("Stop All", (e) => {universal.audioClient.stopAll();}));

style.children.push(new SidebarSlider("Pitch", "pitch", "%", "0.1", "2", "1", (e) => {
  universal.audioClient.setPitch(e.target.value)
}, () => {
  universal.audioClient.setPitch(1);
  setValue("#pitch", 1);
}, 0.1));

style.children.push(new SidebarSlider("Volume", "v", "%", "0", "100", "100", (e) => {
  universal.audioClient.setVolume(e.target.value / 100)
}, () => {
  universal.audioClient.setVolume(1)
  setValue("#v", 100);
}));

async function getAudioOutputDevices(isCable = false) {
	const devices = await navigator.mediaDevices.enumerateDevices();
	const audioOutputs = devices
		.filter(
			(device) =>
				device.kind === "audiooutput" &&
				(isCable
					? device.label.includes("VB-Audio")
					: !device.label.includes("VB-Audio")),
		)
		.map((device) => ({
			name: device.label || "Unknown Audio Output",
			value: device.deviceId,
		}));
	return audioOutputs;
}

const outs = await getAudioOutputDevices();
const ins = await getAudioOutputDevices(true);

const selectMonitor = new SidebarSelect("Monitor", "es-monitor", (e) => {
  universal.save("monitor.sink", e.target.value);
  console.log(`Monitor sink set to ${e.target.value}`);
}, universal.load("monitor.sink"));

selectMonitor.setupValues = async () => {
  return outs.map((device) => device.value);
};

selectMonitor.setupLabels = async () => {
  return outs.map((device) => device.name);
}

const selectCable = new SidebarSelect("VB-Cable", "es-cable", (e) => {
  universal.save("vb.sink", e.target.value);
  console.log(`VB sink set to ${e.target.value}`);
}, universal.load("vb.sink"));

selectCable.setupValues = async () => {
  return ins.map((device) => device.value);
};

selectCable.setupLabels = async () => {
  return ins.map((device) => device.name);
}


const playbackModes = [
	{
		label: "Stop Previous",
		value: "stop_prev",
	},
	{
		label: "Play Over",
		value: "play_over",
	},
];

const playbackModeSelect = new SidebarSelect("Playback Mode", "es-playback", (e) => {
  universal.save("playback-mode", e.target.value);
  console.log(`Playback mode set to ${e.target.value}`);
}, universal.load("playback-mode"));

playbackModeSelect.setupValues = async () => {
  return playbackModes.map((mode) => mode.value);
}

playbackModeSelect.setupLabels = async () => {
  return playbackModes.map((mode) => mode.label);
}

style.children.push(playbackModeSelect);
style.children.push(selectMonitor);
style.children.push(selectCable);

document.querySelector(".sidebar").appendChild(style.build());

universal.listenFor("loadHooks", () => {
  if(universal.load("pitch"))
    setValue("#pitch", Number.parseInt(universal.load("pitch")));
  if(universal.load("vol"))
    setValue("#v", universal.load("vol") * 100);
})

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}