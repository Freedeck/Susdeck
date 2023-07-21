// Freedeck setup script

const path = require('path');
const fs = require('fs');

const pkg = require(path.resolve('./package.json'));

const soundsJSDefault = `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = false;
const ScreenSaverActivationTime = 5;
const soundDir = '../assets/sounds/';
const Sounds = [{"name":"Biggest Bird","path":"biggestbird.wav","icon":null}];
if (typeof module !== 'undefined') module.exports = { cfg:{v:'4.3.0-dev'}, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`;

const settingsJSDefault = `// Welcome to Freedeck internal settings! Here you can.. set.. settings!
// True for yes, false for no

const Settings = {
  UseAuthentication: false, // Turn on authentication (every session/restart will require password)
  Password: 'Freedeck!123', // If you are using authentication, you will log in with this password.
  LoginMessage: 'Hey! This is my Freedeck!', // This message will show for users when they try to login (below "Login to (your name)'s Freedeck")
  YourName: 'John Mangoseed', // Shows alongside your login message,
  Port: 5754
};

module.exports = Settings;
`;

if (process.argv[2] === '--i-know-what-im-doing') {
  fs.writeFileSync(path.join(path.resolve('./src/app/settings') + './sounds.js'), settingsJSDefault);
  fs.writeFileSync(path.resolve('./Settings.js'), soundsJSDefault);
}
