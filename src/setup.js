// Freedeck setup script

const path = require('path');
const fs = require('fs');
const readline = require('readline');

const pkg = require(path.resolve('./package.json'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askBoolean (text) {
  const matching = [false, true, 'false', 'true'];
  rl.question(text + ' (false/true) >', (response) => {
    if (!matching.includes(response)) {
      askBoolean(text);
    };
    return response;
  });
}

function askNumber (text) {
  rl.question(text + ' (number) >', (response) => {
    if (!Number(response)) {
      askNumber(text);
    };
    return response;
  });
}

function askText (text) {
  rl.question(text + ' (string) >', (response) => {
    if (!String(response)) {
      askText(text);
    };
    return response;
  });
}

console.log(`Freedeck v${pkg.version} setup`);
console.log('=-= Sound Initial Setup =-=');
console.log('Each of these are changeable from Companion at any time!');
const sob = askBoolean('Play a sound on button press?');
const ssat = askNumber('Screensaver Activation Time? [Preferrably 5-10 seconds]');

const soundsJSDefault = `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sob};
const ScreenSaverActivationTime = ${ssat};
const soundDir = '../assets/sounds/';
const Sounds = [{"name":"Shooting","icon":"shooting.png","path":"shooting.mp3"},{"name":"Footsteps","icon":"footsteps.png","path":"loudfootsteps.mp3"},{"name":"Whoppah","path":"WHOPPER.mp3","icon":"whopper.png"},{"name":"Didn't I Do It","icon":"borzoi.png","path":"borzio.mp3"},{"name":"Biggest Bird","icon":"bird.png","path":"biggestbird.wav"},{"name":"Disconnect","icon":"disconnect.png","path":"disconnect.mp3"},{"name":"Vine Boom","icon":"boom.png","path":"vineboom.mp3"},{"name":"Semtex","icon":"semtex.png","path":"semtex.mp3"},{"name":"Huh","path":"huh.mp3","icon":"c1908409c8d0326875cdc6801_shocked-face-2832415728.jpg"},{"name":"Haha","path":"haha.mp3","icon":"c1908409c8d0326875cdc6801_shocked-face-2832415728.jpg"},{"name":"Alt Tab","keys":"[\"alt\",\"tab\"]"},{"name":"Whoppah Remix","path":"wopha_remix.wav"},{"name":"Bugatti","path":"bugatti.mp3"},{"name":"Metal Pipe","path":"metal_pipe.mp3"},{"name":"RAHH","path":"rah.mp3","icon":"c1908409c8d0326875cdc6801_shocked-face-2832415728.jpg"}];
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${pkg.version}'}, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`;

console.log('=-= Settings Initial Setup =-=');
console.log('Each of these are changeable from Settings.js at any time!');
console.log('-=- Authentication -=-');
const ua = askBoolean('Use authentication?');

const passwd = askText('Password [If not using auth, leave blank!]');
const lm = askNumber('Login message [If not using auth, leave blank!]');
const yn = askNumber('Your name [If not using auth, leave blank!]');

console.log('-=- Authentication -=-');
const port = askNumber('Port to host server? [Usually 5754]');

const settingsJSDefault = `// Welcome to Freedeck internal settings! Here you can.. set.. settings!
// True for yes, false for no

const Settings = {
  UseAuthentication: ${ua}, // Turn on authentication (every session/restart will require password)
  Password: '${passwd}', // If you are using authentication, you will log in with this password.
  LoginMessage: '${lm}', // This message will show for users when they try to login (below "Login to (your name)'s Freedeck")
  YourName: '${yn}', // Shows alongside your login message,
  Port: ${port},

  // Don't touch!!!
  fdv: '${pkg.version}'
};

module.exports = Settings;
`;

console.log(settingsJSDefault, soundsJSDefault);

if (process.argv[2] === '--i-know-what-im-doing') {
  fs.writeFileSync(path.join(path.resolve('./src/app/settings') + './sounds.js'), settingsJSDefault);
  fs.writeFileSync(path.resolve('./Settings.js'), soundsJSDefault);
}
