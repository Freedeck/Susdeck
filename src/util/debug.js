const dbgUtil = {
  is: false,
  stat: 'Debug',
  log: function (s, t = '') {
    if (t) t = '@' + t;
    if (this.is) { console.log('[DEBUG'+t+'] ' + s); }
  },
  clog: function (t = '') {
    if (this.is) { console.log(t); }
  }
};

if (process.argv[3] === '-dbg') {
  dbgUtil.is = true;
}

module.exports = dbgUtil;
