const settings = require('../../../../Settings');
const sounds = require('../../../settings/sounds');
const dat = require('../../../../package.json');

const fs = require('fs');
const Event = require('../Event');

const ev = new Event('c2s_ver_match', ({ socket, args, loginList }) => {
  const matched = {
    settings: settings.fdv === dat.version,
    sounds: sounds.cfg.v === dat.version
  };

  if (!matched.sounds) {
    sounds.cfg.v = dat.version;
  }

  if (!matched.settings) {
    settings.fdv = dat.version;
  }
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${dat.version}'}, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
fs.writeFileSync('./Settings.js', `// Welcome to Freedeck internal settings! Here you can.. set.. settings!
// True for yes, false for no

const Settings = {
	UseAuthentication: ${settings.UseAuthentication}, // Turn on authentication (every session/restart will require password)
	Password: '${settings.Password}', // If you are using authentication, you will log in with this password.
	LoginMessage: '${settings.LoginMessage}', // This message will show for users when they try to login (below "Login to (your name)'s Freedeck")
	YourName: '${settings.YourName}', // Shows alongside your login message,
	Port: ${settings.Port},

	// Don't touch!!!
	fdv: '${dat.version}'
};

module.exports = Settings;

`);
  socket.emit('updated_settings');
  process.exit();
});

module.exports = ev;
