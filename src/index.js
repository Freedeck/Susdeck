const picocolors = require('./utils/picocolors');
const fs = require('fs');
const path = require('path');
const debug = require('./utils/debug');

let DOES_RUN_SERVER = true;

const DOES_SETTINGS_EXIST_YET = fs.existsSync(path.resolve('./src/configs/config.fd.js'));

if (!DOES_SETTINGS_EXIST_YET) {
  require(path.resolve('./src/private/setup.js'))().then(() => {
    console.log(picocolors.bgGreen('Setup complete!'));
    const spawn = require('child_process').spawn;

    process.on('exit', () => {
      const child = spawn('npm', ['start'], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
        shell: true,
        env: process.env,
      });

      child.unref();
    });
  });
}

if (process.argv[2] === 'server') {
  console.log(picocolors.blue('Server only mode.'));
} else {
  if (DOES_SETTINGS_EXIST_YET) require('./companionInit')('./src/fdconnect.html', true, 1145, 750, false);
  if (process.argv[2] == 'companion') {
    console.log(picocolors.blue('Companion only mode.'));
    DOES_RUN_SERVER = false;
  }
}

if (DOES_RUN_SERVER && DOES_SETTINGS_EXIST_YET) require('./server');


const setupTerm = () => {
  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit',
  ].forEach((sig) => {
    process.on(sig, () => {
      if (sig == 'SIGINT') {
        console.log('So you have chosen an unclean death. Goodbye.');
      }
      terminator(sig);
      debug.log('Signal received: ' + sig);
    });
  });

  const terminator = (sig) => {
    if (typeof sig === 'string') {
    // call your async task here and then call process.exit() after async task is done
      if (fs.existsSync(path.resolve('./src/public/hooks'))) {
        fs.rmSync(path.resolve('./src/public/hooks'), {recursive: true});
        console.log('Hooks unloaded.');
      }
      if (fs.existsSync(path.resolve('./tmp'))) {
        fs.rmSync(path.resolve('./tmp'), {recursive: true});
        console.log('Plugins unloaded. Bye!');
      }

      setTimeout(() => {
        process.exit(1);
      });
    }
  };
};

if (DOES_SETTINGS_EXIST_YET) setupTerm();
