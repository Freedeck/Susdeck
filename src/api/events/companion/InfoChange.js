const sounds = require('../../../settings/sounds');
const fs = require('fs');
const jsonbeautify = require('json-beautify');

module.exports = {
  event: 'c-info-change',
  callback: (socket, args) => {
    args = JSON.parse(args);
    if (args.type === 'key_edit') {
      const newObject = {};
      try {
        const found = sounds.Sounds.find(thing => thing.path === args.key);
        sounds.Sounds.forEach(thing => {
          newObject.name = args.newname;
          newObject.icon = thing.icon;
          if (thing.key === args.key) newObject.key = args.newpath;
          if (thing.path === args.key) newObject.path = args.newpath;
        });
        Object.assign(found, newObject);
      } catch (err) {
        console.log('Error!', err);
      }

      fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);

      return 'c-change';
    } else if (args.type === 'ssat_soc') {
      fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${args.soc};
const ScreenSaverActivationTime = ${args.screenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
    }
  }
};
