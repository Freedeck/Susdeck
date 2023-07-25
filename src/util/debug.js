const dbgUtil = {
  is: false,
  stat: 'Debug',
  log: function (s, t = '') {
    if (t) t = '@' + t;
    if (this.is) { console.log('[DEBUG' + t + '] ' + s); }
  },
  clog: function (t = '') {
    if (this.is) { console.log(t); }
  }
};

if (process.argv[2] === '--debug') {
  dbgUtil.is = true;
}

module.exports = dbgUtil;
