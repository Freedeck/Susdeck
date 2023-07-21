const fs = require('fs');
const path = require('path');
const debug = require('../../../util/debug');
const Event = require('../Event');

const ev = new Event('c-theme', ({ args }) => {
  debug.log('Set theme: ' + args);
  fs.writeFileSync(path.join(path.dirname(require.main.filename) + '/api/persistent/theme.sd'), args);
  return 'c-change';
});

module.exports = ev;
