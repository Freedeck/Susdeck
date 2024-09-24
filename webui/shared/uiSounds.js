let enabled = () => universal.load("uiSounds") === "true";
let currentSoundpack = "futuristic.soundpack";
let info = {};
let sounds = {};
const playing = [];

function initialize() {
  enabled = () => universal.load("uiSounds") === "true";
  universal.CLU("Boot / UI Sounds", "Set enabled");
  reload();
  universal.CLU("Boot / UI Sounds", "Reloaded sounds");
}

function reload() {
	if (!enabled()) return;
	currentSoundpack =
		universal.load("soundpack") || "futuristic.soundpack";
    universal.CLU("Boot / UI Sounds", "Auto-detecting current soundpack");
  load(currentSoundpack).then(() => {
    universal.CLU("Boot / UI Sounds", "Loaded current soundpack.");
		playSound("page_enter");
	});
}

async function load(soundpack) {
  universal.CLU("Boot / UI Sounds", `Loading soundpack ${soundpack}`);
  const res = await fetch(
    `/common/sounds/${soundpack}/manifest.fdsp.json`,
  ).catch((err) => {
    console.error(err);
    universal.sendToast(
      "Failed to load soundpack. Defaulting to futuristic.",
    );
    currentSoundpack = "futuristic.soundpack";
    reload();
  });
  universal.CLU("Boot / UI Sounds", "Fetched manifest");
  const data = await res.json();
  sounds = data.sounds;
  info = data.info;
  universal.uiSounds.info = info;
  return true;
}

async function playSound(name) {
  if (!enabled) return;
  universal.audioClient.play({
    file: `/common/sounds/${info.id}/${sounds[name]}`,
    name,
    channel: universal.audioClient.channels.ui,
    stopPrevious: false,
    volume: 0.5,
  });
}

export default {
  enabled,
  currentSoundpack,
  info,
  sounds,
  playing,
  initialize,
  reload,
	load,
	playSound,
};
