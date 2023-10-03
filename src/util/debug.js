const dbgUtil = {
  is: false,
  stat: 'Debug',
  log: (s, t = '') => {
    if (t) t = '@' + t;
    if (dbgUtil.is) { console.log('[DEBUG' + t + '] ' + s); }
  },
  clog: (t = '') => {
    if (dbgUtil.is) { console.log(t); }
  }
};

if (process.argv[2] === '--debug') {
  dbgUtil.is = true;
}

module.exports = dbgUtil;
