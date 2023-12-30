const picocolors = require('./utils/picocolors');

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
