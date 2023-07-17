const sounds = require('../../../settings/sounds');
const Event = require('../Event');
const fs = require('fs');

const ev = new Event('c-newkey', (socket, args) => {
  sounds.Sounds.push(args);
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
});

module.exports = ev;
