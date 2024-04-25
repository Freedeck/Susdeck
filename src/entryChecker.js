const path = require('path');
const package = require(path.resolve('./package.json'));

console.log('Checking for updates... (start with --no-update to skip)');
if (process.argv.includes('--no-update')) {
  console.log('Skipping update check.');
} else {
  fetch("https://raw.githubusercontent.com/Freedeck/Freedeck/master/autoupdate")
  .then((res)=>res.text())
  .then((ver) => {
	if(package.version !== ver) {
		console.log('Update available! Installing update.'); 
		const { spawn } = require('child_process');

// Create a new child process for 'git pull'
const pull = spawn('git', ['pull'], { detached: true, stdio: 'ignore' });

// Allow the parent to exit independently of the child
pull.unref();

// Create a new child process for 'git fetch'
const fetch = spawn('git', ['fetch'], { detached: true, stdio: 'ignore' });

// Allow the parent to exit independently of the child
fetch.unref();

// Exit the parent process
process.exit();
	}
  })
}

require(path.resolve('./src/index.js'));
