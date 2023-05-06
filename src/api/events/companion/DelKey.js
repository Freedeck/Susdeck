const sounds = require('../../../settings/sounds');
const fs = require('fs');
const jsonbeautify = require('json-beautify');
const Event = require('../Event');

const ev = new Event('c-delete-key', (socket, args) => {
  sounds.Sounds.splice(sounds.Sounds.indexOf({ name: args.name }), 1);
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const soundDir = '../assets/sounds/';
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };`);
  return 'c-change';
});

module.exports = ev;
