const sounds = require('../../../settings/sounds');
const fs = require('fs');
const jsonbeautify = require('json-beautify');

module.exports = {
  event: 'c-delkey',
  callback: (socket, args) => {
    sounds.Sounds.splice(sounds.Sounds.indexOf({ name: args.name, key: args.key }), 1);
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress}
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime}
const soundDir = '../assets/sounds/'
const Sounds = ${jsonbeautify(sounds.Sounds)}
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, Sounds }`);
    return 'c-change';
  }
};
