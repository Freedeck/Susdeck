const path = require('path');
const pkg = require(path.resolve('./package.json'));

console.log('Checking for updates... (start with --no-update to skip)');
if (process.argv.includes('--no-update')) {
	console.log('Skipping update check.');
	require(path.resolve('./src/index.js'));
	return;
  }
const autoupd = async () => {
	const autoDat = await fetch('https://raw.githubusercontent.com/Freedeck/Freedeck/v6/autoupdate?t=' + Date.now())
const ver = await autoDat.text()
if (pkg.version !== ver) {
	console.log('Update available! Running \'git pull\'. [1/2] (Updating from ' + pkg.version + ' to ' + ver + ')');
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
	})
  }
}

autoupd();

require(path.resolve('./src/index.js'));




