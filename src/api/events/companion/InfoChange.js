const sounds = require('../../../settings/sounds');
const fs = require('fs');
const Event = require('../Event');

const ev = new Event('c-info-change', (socket, args) => {
  args = JSON.parse(args);
  if (args.type === 'key_edit') {
    const newObject = {};
    try {
      const found = sounds.Sounds.find(thing => thing.path === args.path);
      if (!found) {
        throw new Error('Unsupported or uneditable sound.');
      }
      sounds.Sounds.forEach(thing => {
        console.log(thing.keys, args.keysArr)
        if ('keys' in thing && JSON.parse(thing.keys) === args.keysArr) newObject.keys = args.keysArr;
        if (thing.path === args.path && args.path !== '') newObject.path = args.newpath;
        newObject.name = args.newname;
        newObject.icon = thing.icon;
      });
      Object.assign(found, newObject);
    } catch (err) {
      console.log('Error!', err);
    }

    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);

    return 'c-change';
  } else if (args.type === 'ssat_soc') {
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${args.soc};
const ScreenSaverActivationTime = ${args.screenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
  }
});

module.exports = ev;
