// Freedeck setup script

const path = require('path');
const fs = require('fs');

const pkg = require(path.resolve('./package.json'));

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

const question = function (q) {
  let response;

  return new Promise((resolve, reject) => {
    console.log(q);
    process.stdin.once('data', (data) => {
      response = data.toString().trim();
      resolve(response);
    });
  });
};
console.clear();
console.log(`Freedeck v${pkg.version} setup`);
console.log('=-= Sound Initial Setup =-=');
console.log('Each of these are changeable from Companion at any time!');
const matching = [false, true, 'false', 'true'];
// eslint-disable-next-line no-var
var sob, ssat, ua, passwd, lm, yn, port;

question('Play sound on button press?' + ' (false/true) >').then(response => {
  sob = response;
  if (!matching.includes(response)) sob = false;
  question('Screensaver activation time?' + ' (number) >').then(ssatr => {
    ssat = ssatr;
    console.log('\n=-= Settings Initial Setup =-=');
    console.log('Each of these are changeable from Settings.js at any time!');
    console.log('-=- Authentication -=-');
    question('Use authentication?' + ' (false/true) >').then(uar => {
      ua = uar;
      if (!matching.includes(uar)) ua = false;
      if (ua === 'false' || ua === false) {
        question('Port to host server? [Usually 5754]' + ' (number) >').then(response => {
          if (!Number(response)) response = 5754;
          port = response;
          afterResponses(sob, ssat, ua, passwd, lm, yn, port);
        });
      } else {
        question('Password [If not using auth, leave blank!]' + ' (string) >').then(pw => {
          passwd = pw;
          question('Login Message [If not using auth, leave blank!]' + ' (string) >').then(lmr => {
            lm = lmr;
            question('Your Name [If not using auth, leave blank!]' + ' (string) >').then(ynr => {
              yn = ynr;
              question('Port to host server? [Usually 5754]' + ' (number) >').then(response => {
                if (!Number(response)) response = 5754;
                port = response;
                afterResponses(sob, ssat, ua, passwd, lm, yn, port);
              });
            });
          });
        });
      }
    });
  });
});

function afterResponses (sob, ssat, ua, passwd, lm, yn, port) {
  const soundsJSDefault = `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sob};
const ScreenSaverActivationTime = ${ssat};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify([{ name: 'Shooting', icon: 'shooting.png', path: 'shooting.mp3' }, { name: 'Footsteps', icon: 'footsteps.png', path: 'loudfootsteps.mp3' }, { name: 'Whoppah', path: 'WHOPPER.mp3', icon: 'whopper.png' }, { name: "Didn't I Do It", icon: 'borzoi.png', path: 'borzio.mp3' }, { name: 'Biggest Bird', icon: 'bird.png', path: 'biggestbird.wav' }, { name: 'Disconnect', icon: 'disconnect.png', path: 'disconnect.mp3' }, { name: 'Vine Boom', icon: 'boom.png', path: 'vineboom.mp3' }, { name: 'Semtex', icon: 'semtex.png', path: 'semtex.mp3' }, { name: 'Huh', path: 'huh.mp3' }, { name: 'Haha', path: 'haha.mp3' }, { name: 'Alt Tab', keys: '["alt","tab"]' }, { name: 'Whoppah Remix', path: 'wopha_remix.wav' }, { name: 'Bugatti', path: 'bugatti.mp3' }, { name: 'Metal Pipe', path: 'metal_pipe.mp3' }, { name: 'RAHH', path: 'rah.mp3' }])};
const cfg = {v:'${pkg.version}'}; // Don't touch pls
if (typeof module !== 'undefined') module.exports = { cfg, SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`;

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
  console.log('[Freedeck] Writing your settings..');
  fs.mkdirSync(path.resolve('./src/settings'));
  fs.writeFileSync(path.join(path.resolve('./src/settings') + '/sounds.js'), soundsJSDefault);
  fs.writeFileSync(path.resolve('./Settings.js'), settingsJSDefault);
  fs.writeFileSync(path.join(path.resolve('./src/api/persistent') + '/theme.sd'), 'Default');
  console.log('[Freedeck] Finished setup, exiting! Start Freedeck with `npm start`.');
  process.exit(0);
}
