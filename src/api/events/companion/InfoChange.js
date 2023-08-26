const sounds = require('../../../settings/sounds');
const fs = require('fs');
const Event = require('../Event');

const ev = new Event('c-info-change', ({ socket, args, meta }) => {
  args = JSON.parse(args);
  if (args.type === 'key_edit') {
    try {
      const newObject = {};
      let found;
      found = sounds.Sounds.find(thing => thing.name === args.name);
      if (args.path !== undefined) found = sounds.Sounds.find(thing => thing.path === args.path);
      if (!found) found = sounds.Sounds.find(thing => thing.keys === JSON.stringify(args.ogValues));
      if (args.keysArr[1]) {
        args.keysArr[0] = args.keysArr[0].toLowerCase();
        args.keysArr[1] = args.keysArr[1].toLowerCase();
      }
      if (found.keys === JSON.stringify(args.ogValues)) newObject.keys = JSON.stringify(args.keysArr);
      if ('path' in found && found.path === args.oldpath && args.oldpath !== '') newObject.path = args.newpath;
      newObject.name = args.newname;
      if (!found.icon) newObject.icon = args.icon;
      if (found.icon === args.oldIcon && args.icon !== args.oldIcon) newObject.icon = args.icon;
      Object.assign(found, newObject);
    } catch (err) {
      console.log('Error!', err);
      socket.emit('server_notification', err.toString());
    }

    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${meta.fdVersion}'}, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);

    return 'c-change';
  } else if (args.type === 'screenSaver_soc') {
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${args.soc};
const ScreenSaverActivationTime = ${args.screenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${meta.fdVersion}'}, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
  }
});

module.exports = ev;
