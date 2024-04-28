const {parentPort} = require('worker_threads');
const pl = require('../../plugins'); // replace with the actual path
const picocolors = require('picocolors');

parentPort.on('message', (file) => {
  try {
    pl.load(file);
  } catch (err) {
    console.log(picocolors.red('Error while trying to load plugin ' + file + ': ' + err), 'Plugin Manager');
    if (err.includes('hooks')) {
      console.log('This seems to be a hook error. Hold on, because we\'re gonna try again.');
      pl.load(file);
    }
  }
});
