const path = require('path');
const fs = require('fs');
const scrts = require('./src/configs/secrets.fd');
const picocolors = require('./src/utils/picocolors');

const pkg = require(path.resolve('./package.json'));

const question = (q) => {
  let response;

  return new Promise((resolve, reject) => {
    console.log(q);
    process.stdin.once('data', (data) => {
      response = data.toString().trim();
      resolve(response);
    });
  });
};

module.exports = {
  run: () => {
    let port; let password; let screenSaverActivationTime; let soundOnPress; let useAuthentication; let iconCountPerPage;
    console.log(picocolors.bgBlue('Welcome to the Freedeck Setup Wizard!'));
    console.log(picocolors.bgBlue('This will guide you through the setup process.'));
    question('What port would you like to use? (default: 5754)').then((port) => {
      if (!Number(port) || port === '') port = 5754;
      question('What password would you like to use? (default: Freedeck!123)').then((password) => {
        if (password === '') password = 'Freedeck!123';
        question('How many icons would you like to have per page? (default: 8)').then((iconCountPerPage) => {
          if (!Number(iconCountPerPage) || iconCountPerPage === '') iconCountPerPage = 8;
          question('How long would you like the screen saver to wait before activating? (default: 5)').then((screenSaverActivationTime) => {
            if (!Number(screenSaverActivationTime) || screenSaverActivationTime === '') screenSaverActivationTime = 5;
            question('Would you like to have sound on keypress? (default: yes)').then((soundOnPress) => {
              if (soundOnPress === '') soundOnPress = true;
              question('Would you like to use authentication? (default: yes)').then((useAuthentication) => {
                if (useAuthentication === '') useAuthentication = true;
                console.log(picocolors.bgBlue('Thank you for using the Freedeck Setup Wizard!'));
                console.log(picocolors.bgBlue('Generating config file...'));
                const config = {
                  port: port,
                  password: password,
                  screenSaverActivationTime: screenSaverActivationTime,
                  soundOnPress: soundOnPress,
                  useAuthentication: useAuthentication,
                  iconCountPerPage: iconCountPerPage,
                  profile: 'defaultProfile',
				  profiles:{'defaultProfile':[{'Welcome!': {'uuid': 'FDA-WELCOME-DEFAULT', 'type': 'fd.none', 'data': {'msg': 'I see you\'re looking in the JSON file! I\'d recommend you add some sounds first before peeking and seeing how Freedeck stores button data, just so you don\'t crash your Freedeck unexpectedly. But, if you\'re here, you probably know what you\'re doing. Have at it.'}, 'pos': 0}}]}
                };
                fs.writeFileSync(path.resolve('./src/configs/config.fd.js'), `const cfg = ${JSON.stringify(config)}; if (typeof window !== 'undefined') window['cfg'] = cfg; if ('exports' in module) module.exports = cfg;`);
                console.log(picocolors.bgBlue('Generating secrets file...'));
                fs.writeFileSync(path.resolve('./src/configs/secrets.fd.js'), `const crypto = require('crypto');
module.exports = {s:{password: '${scrts.hash(password)}'},hash: (data) => 'fd.' + crypto.createHash('sha512').update(data).digest().toString('hex')};`);
				console.log(picocolors.bgGreen('All done!'));
				return true;
              });
            });
          });
        });
      });
    });
  },
};
