const picocolors = require('./utils/picocolors');
const fs = require('fs');
const path = require('path');
const debug = require('./utils/debug');

let DOES_RUN_SERVER = true;

const DOES_SETTINGS_EXIST_YET = fs.existsSync(path.resolve('./src/configs/config.fd.js'));

const pkg = require(path.resolve('./package.json'));
const settings = require('./managers/settings');

const {BrowserWindow, app} = require('electron');
fs.writeFileSync(path.resolve('./FreedeckCore.log'), `A{${Date.now()}} Cleared. Launching autoupdater.\n`);
const appSettings = settings.settings();
debug.writeLogs = appSettings.writeLogs;

const autoupd = async () => {
  console.log('Checking for updates... (start with --no-update to skip)');
  if (process.argv.includes('--no-update')) {
    console.log('Skipping update check.');
    require(path.resolve('./src/index.js'));
    return;
  }
  return new Promise(async (resolve, reject) => {
    const autoDat = await fetch('https://freedeck.app/release?t=' + Date.now())
        .catch((er) => {
          resolve(true);
          err = 1; console.log(picocolors.bgRed('Unable to fetch autoupdate information' + er));
        });
    const autoDatTe = await (await autoDat.text().catch((er) => {
      resolve(true);
      console.log(picocolors.bgRed('Error while getting text: ' + er));
    }));
    const verData = autoDatTe.split('\n');
    const cfg = settings.settings();
    if (cfg.release != 'stable' && cfg.release != 'dev') {
      console.log(picocolors.bgRed('Unable to find autoupdate information. Defaulting to stable.'));
      cfg['release'] = 'stable';
      settings.save();
    }
    const ver = verData[cfg.release === 'stable' ? 0 : 1];
    if (pkg.version !== ver) {
      console.log('You\'re on the release channel: ' + cfg.release + '. Latest version: ' + ver + '. Current version: ' + pkg.version + '.');
      console.log('Update available! Running \'git pull\'. [1/2]');
      const {exec} = require('child_process');

      // Create a new child process for 'git pull'
      exec('git stash', () => {
        console.log('Stashed just in case. Running \'git pull\'. [1/2]');
        exec('git pull', () => {
          console.log('Pulled latest changes. Running \'git fetch\'. [2/2]');
          exec('git fetch', () => {
            console.log('Fetched latest changes. Please start Freedeck again.');
            process.exit(0);
          });
        });
      });
    } else {
      console.log('Freedeck is up to date!');
      resolve(true);
    }
  });
};

const createSplashWindow = () => {
  const splash = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    icon: path.resolve('./assets/logo_big.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  splash.loadFile(path.resolve('./src/private/splash.html'));
  return splash;
};

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

if (!DO_COMPANION && DOES_RUN_SERVER && DOES_SETTINGS_EXIST_YET) require('./server');
if (DO_COMPANION) {
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

if (DOES_SETTINGS_EXIST_YET) setupTerm();


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
