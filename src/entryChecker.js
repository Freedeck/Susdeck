const path = require('path');
const pkg = require(path.resolve('./package.json'));

console.log('Checking for updates... (start with --no-update to skip)');
if (process.argv.includes('--no-update')) {
  console.log('Skipping update check.');
} else {
  fetch('https://raw.githubusercontent.com/Freedeck/Freedeck/master/autoupdate')
      .then((res)=>res.text())
      .then((ver) => {
        if (pkg.version !== ver) {
          console.log('Update available! Running \'git pull\'. [1/2]');
          const {spawn} = require('child_process');

          // Create a new child process for 'git pull'
          const spawned = spawn('git', ['pull'], {detached: true, stdio: 'ignore'});
          spawned.on('exit', () => {
            console.log('Pulled latest changes. Running \'git fetch\'. [2/2]');
            const spawned2 = spawn('git', ['fetch'], {detached: true, stdio: 'ignore'});
            spawned2.on('exit', () => {
              console.log('Fetched latest changes. Please start Freedeck again.');
			  process.exit(0);
            });
          });
        } else {
          require(path.resolve('./src/index.js'));
        }
      });
}

