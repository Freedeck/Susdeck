const sounds = require('../../../settings/sounds');
const fs = require('fs');
const jsonbeautify = require('json-beautify');

module.exports = {
  event: 'c-info-change',
  callback: (socket, args) => {
    if (args.includes('SETKEY')) {
      const soundChangeData = args.split('SETKEY:')[1];
      const tobechanged = soundChangeData.split(':')[0];
      const newkeybind = soundChangeData.split(':')[1];
      const newname = soundChangeData.split(':')[2];
      const newObject = {};
      const found = sounds.Sounds.find(thing => thing.key === tobechanged);
      sounds.Sounds.forEach(thing => {
        if (thing.key === tobechanged) {
          console.log(thing);
          newObject.key = newkeybind;
          newObject.name = newname;
          newObject.icon = thing.icon;
        }
      });
      Object.assign(found, newObject);

      fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress}
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime}
const soundDir = '../assets/sounds/'
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)}
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds }
`);

      return 'c-change';
    } else if (args.includes(',')) {
      args = args.split(',');
      const newssattime = args[0].split('SSAT:')[1];
      const newssoc = args[1].split('SOC:')[1];

      fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${newssoc}
const ScreenSaverActivationTime = ${newssattime}
const soundDir = '../assets/sounds/'
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)}
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds }
`);

      console.log(`const SoundOnPress = ${newssattime}`);
    }
  }
};
