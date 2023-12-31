const picocolors = require('./utils/picocolors');
const fs = require('fs');
const path = require('path');
const debug = require('./utils/debug');

let DOES_RUN_SERVER = true;

if (process.argv[2] === 'server') {
  console.log(picocolors.blue('Server only mode.'));
} else {
  require('./companionInit');
  if (process.argv[2] == 'companion') {
    console.log(picocolors.blue('Companion only mode.'));
    DOES_RUN_SERVER = false;
  }
}

if (DOES_RUN_SERVER) require('./server');

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
    fs.rmSync(path.resolve('./src/public/hooks'), {recursive: true});
    console.log('Hooks unloaded.');
    fs.rmSync(path.resolve('./tmp'), {recursive: true});
    console.log('Plugins unloaded. Bye!');

    setTimeout(() => {
      process.exit(1);
    });
  }
};

