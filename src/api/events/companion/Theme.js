const fs = require('fs');
const path = require('path');
const debug = require('../../../util/debug');
const Event = require('../Event');

const ev = new Event('fd.companion.theme', ({ args }) => {
  debug.log('Set theme: ' + args);
  fs.writeFileSync(path.join(path.dirname(require.main.filename) + '/api/persistent/theme.sd'), args);
  return { type: 'c-change' };
}, true);

module.exports = ev;
