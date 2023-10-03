const picocolors = require('./picocolors');

const dbgUtil = {
  is: process.argv[2] === '--debug',
  stat: 'Debug',
  log: (s, t = '') => {
    if (t) t = '@' + t;
    if (dbgUtil.is) { console.log(picocolors.yellow('[DEBUG' + t + '] ' + s)); }
  },
  clog: (t = '') => {
    if (dbgUtil.is) { console.log(t); }
  }
};

module.exports = dbgUtil;
