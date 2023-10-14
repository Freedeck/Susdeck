const Event = require('../Event');
const sounds = require('../../../settings/sounds');
const fs = require('fs');

const ev = new Event('c-sort', ({ socket, args, meta }) => {
  sounds.Sounds = arrayMove(sounds.Sounds, args.oidx, args.nidx);
  const a = [];
  sounds.Sounds.forEach(sound => {
    if (sound === null) sound = { name: '_fd_spacer', uuid: 'FDS-' + require('crypto').randomBytes(8).toString('hex') };
    a.push(sound);
  });
  sounds.Sounds = a;
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${meta.fdVersion}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
  return { type: 'sorted' };
}, true);

const arrayMove = (arr, oldIndex, newIndex) => {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  return arr; // for testing
};

module.exports = ev;
