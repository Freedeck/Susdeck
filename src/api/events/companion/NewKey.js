const sounds = require('../../../settings/sounds');
const Event = require('../Event');
const fs = require('fs');

const ev = new Event('fd.companion.newkey', ({ args, meta }) => {
  sounds.Sounds.push(args);
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${meta.fdVersion}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
  return { type: 'c-newkey' };
}, true);

module.exports = ev;
