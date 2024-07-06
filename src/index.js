const picocolors = require('./utils/picocolors');
const fs = require('fs');
const path = require('path');
const debug = require('./utils/debug');

let DOES_RUN_SERVER = true;
const DOES_SETTINGS_EXIST_YET = fs.existsSync(path.join(__dirname, 'configs/config.fd.js'));

if (!DOES_SETTINGS_EXIST_YET) {
  const {app} = require('electron');
  app.on('ready', () => {
    require(path.resolve('./src/private/setup.js'))().then(() => {
      console.log(picocolors.bgGreen('Setup complete!'));
      app.quit();
    });
  });
  return;
}

const settings = require('./managers/settings');

fs.writeFileSync(path.resolve('./FreedeckCore.log'), `A{${Date.now()}} Cleared. Launching autoupdater.\n`);
const appSettings = settings.settings();
debug.writeLogs = appSettings.writeLogs;

let DO_COMPANION = true;

if (process.argv.includes('--server-only')) {
  console.log(picocolors.blue('Server only mode.'));
  DO_COMPANION = false;
} else {
  if (process.argv.includes('--companion-only')) {
    console.log(picocolors.blue('Companion only mode.'));
    DOES_RUN_SERVER = false;
  }
}

if (!DO_COMPANION && DOES_RUN_SERVER) require('./server');
if (DO_COMPANION) {
  const {app} = require('electron');
  app.whenReady().then(() => {
    require('./companionInit')('./src/fdconnect.html', true, 1145, 750, false);
    if (DOES_RUN_SERVER) require('./server');
    // const splash = createSplashWindow();
    // autoupd().then(() => {
    //   splash.hide();
    //   splash.close();
    // });
  });
}

setupTerm();

/**
 * Setup the terminal
 */
function setupTerm() {
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
