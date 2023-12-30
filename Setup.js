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
                profile: 'Default',
                profiles: {
                  Default: [
                    {
                      'Biggest Bird': {
                        'type': 'fd.sound',
                        'pos': 0,
                        'uuid': 'BuiltIn.0.1',
                        'data': {
                          'file': 'biggest-bird.wav',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Bugatti': {
                        'type': 'fd.sound',
                        'pos': 1,
                        'uuid': 'BuiltIn.0.2',
                        'data': {
                          'file': 'bugatti.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'COD Footsteps': {
                        'type': 'fd.sound',
                        'pos': 2,
                        'uuid': 'BuiltIn.0.3',
                        'data': {
                          'file': 'cod-footsteps.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'COD Shooting': {
                        'type': 'fd.sound',
                        'pos': 3,
                        'uuid': 'BuiltIn.0.3',
                        'data': {
                          'file': 'cod-shooting.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Disconnect': {
                        'type': 'fd.sound',
                        'pos': 4,
                        'uuid': 'BuiltIn.0.4',
                        'data': {
                          'file': 'disconnect.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Let Me Do It For You': {
                        'type': 'fd.sound',
                        'pos': 5,
                        'uuid': 'BuiltIn.0.5',
                        'data': {
                          'file': 'do-it-for-you.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Haha': {
                        'type': 'fd.sound',
                        'pos': 6,
                        'uuid': 'BuiltIn.0.6',
                        'data': {
                          'file': 'haha.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Huh': {
                        'type': 'fd.sound',
                        'pos': 7,
                        'uuid': 'BuiltIn.0.7',
                        'data': {
                          'file': 'huh.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'iPhone Ringtone Remix': {
                        'type': 'fd.sound',
                        'pos': 8,
                        'uuid': 'BuiltIn.0.8',
                        'data': {
                          'file': 'iphone-remix.wav',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Metal Pipe': {
                        'type': 'fd.sound',
                        'pos': 9,
                        'uuid': 'BuiltIn.0.9',
                        'data': {
                          'file': 'metal-pipe.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Mr Beast!': {
                        'type': 'fd.sound',
                        'pos': 10,
                        'uuid': 'BuiltIn.1.0',
                        'data': {
                          'file': 'mr-beeast.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Ohio': {
                        'type': 'fd.sound',
                        'pos': 11,
                        'uuid': 'BuiltIn.1.1',
                        'data': {
                          'file': 'ohio.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Rah': {
                        'type': 'fd.sound',
                        'pos': 12,
                        'uuid': 'BuiltIn.1.2',
                        'data': {
                          'file': 'rah.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'COD Semtex': {
                        'type': 'fd.sound',
                        'pos': 13,
                        'uuid': 'BuiltIn.1.3',
                        'data': {
                          'file': 'semtex.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Vine Boom': {
                        'type': 'fd.sound',
                        'pos': 14,
                        'uuid': 'BuiltIn.1.4',
                        'data': {
                          'file': 'vine-boom.mp3',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Whopper Remix': {
                        'type': 'fd.sound',
                        'pos': 15,
                        'uuid': 'BuiltIn.1.5',
                        'data': {
                          'file': 'whopper-remix.wav',
                          'path': '/sounds/',
                        },
                      },
                    },
                    {
                      'Whopper': {
                        'type': 'fd.sound',
                        'pos': 16,
                        'uuid': 'BuiltIn.1.6',
                        'data': {
                          'file': 'whopper.mp3',
                          'path': '/sounds/',
                        },
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
