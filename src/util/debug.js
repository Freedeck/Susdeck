const dbgUtil = {
  is: false,
  stat: 'Debug',
  log: function (s, t='') {
    if (t) t = '@' + t;
    if (this.is) { console.log('[DEBUG'+t+'] ' + s); }
  }
};

if (process.argv[3] === '-dbg') {
  dbgUtil.is = true;
}

module.exports = dbgUtil;
