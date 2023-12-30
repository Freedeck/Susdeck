const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const scrts = {
  hash: (p) => 'fd.' + crypto.createHash('sha512').update(p).digest('hex'),
};
const picocolors = require('./src/utils/picocolors');

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

const Message = `I see you\'re looking in the JSON file!
I\'d recommend you add some sounds first before peeking and seeing how Freedeck stores button data, just so you don\'t crash your Freedeck unexpectedly.
But, if you\'re here, you probably know what you\'re doing. Have at it.`;

module.exports = () => {
  console.log(picocolors.bgBlue('Welcome to the Freedeck Setup Wizard!'));
  console.log(
      picocolors.bgBlue('This will guide you through the setup process.'),
  );
  question('What port would you like to use? (default: 5754)').then((port) => {
    if (!Number(port) || port === '') port = 5754;
    question(
        'What password would you like to use? (default: Freedeck!123)',
    ).then((password) => {
      if (password === '') password = 'Freedeck!123';
      question(
          'How many icons would you like to have per page? (default: 8)',
      ).then((iconCountPerPage) => {
        if (!Number(iconCountPerPage) || iconCountPerPage === '') {
          iconCountPerPage = 8;
        }
        question(
            'How long would you like the screen saver to wait before activating? (default: 5)',
        ).then((screenSaverActivationTime) => {
          if (
            !Number(screenSaverActivationTime) ||
            screenSaverActivationTime === ''
          ) {
            screenSaverActivationTime = 5;
          }
          question(
              'Would you like to have sound on keypress? (default: yes)',
          ).then((soundOnPress) => {
            if (soundOnPress === '') soundOnPress = true;
            question(
                'Would you like to use authentication? (default: yes)',
            ).then((useAuthentication) => {
              if (useAuthentication === '') useAuthentication = true;
              console.log(
                  picocolors.bgBlue(
                      'Thank you for using the Freedeck Setup Wizard!',
                  ),
              );
              console.log(picocolors.bgBlue('Generating config file...'));
              const config = {
                port: port,
                password: password,
                screenSaverActivationTime: screenSaverActivationTime,
                soundOnPress: soundOnPress,
                useAuthentication: useAuthentication,
                iconCountPerPage: iconCountPerPage,
                profile: 'defaultProfile',
                profiles: {
                  defaultProfile: [
                    {
                      'Welcome!': {
                        uuid: 'FDA-WELCOME-DEFAULT',
                        type: 'fd.none',
                        data: {
                          msg: Message.replace(/\n/g, ' '),
                        },
                        pos: 0,
                      },
                    },
                  ],
                },
              };
              if (!fs.existsSync(path.resolve('./src/configs'))) {
                fs.mkdirSync(path.resolve('./src/configs'));
              }
              if (!fs.existsSync(path.resolve('./plugins'))) {
                fs.mkdirSync(path.resolve('./plugins'));
              }
              fs.writeFileSync(
                  path.resolve('./src/configs/config.fd.js'),
                  `const cfg = ${JSON.stringify(
                      config,
                  )}; if (typeof window !== 'undefined') window['cfg'] = cfg; if ('exports' in module) module.exports = cfg;`,
              );
              console.log(picocolors.bgBlue('Generating secrets file...'));
              fs.writeFileSync(
                  path.resolve('./src/configs/secrets.fd.js'),
                  `const crypto = require('crypto');
module.exports = {s:{password: '${scrts.hash(
      password,
  )}'},hash: (data) => 'fd.' + crypto.createHash('sha512').update(data).digest().toString('hex')};`,
              );
              console.log(picocolors.bgGreen('All done!'));
              process.exit(0);
            });
          });
        });
      });
    });
  });
};

if (process.argv[2] === 'FULL_RESET_I_KNOW_WHAT_IM_DOING') {
  const dif = (a) => {
    if (fs.existsSync(path.resolve(a))) return fs.unlinkSync(path.resolve(a));
  };
  console.log('Full reset requested.. you know what you\'re doing!');
  console.log('Deleting config files...');
  dif('./src/configs/config.fd.js');
  dif('./src/configs/secrets.fd.js');
  console.log('Deleting config dir...');
  if (fs.existsSync(path.resolve('./src/configs/'))) {
    fs.rmdirSync(path.resolve('./src/configs'));
  }
  console.log('Making Freedeck good as new...');
  if (fs.existsSync(path.resolve('./plugins/'))) {
    fs.rmdirSync(path.resolve('./plugins'));
  }
  console.log('Done!!!');
} else {
  module.exports();
}
