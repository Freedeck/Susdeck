const dbgUtil = {
  is: false,
  stat: 'Debug',
  log: function (s) {
    if (this.is) { console.log('[DEBUG] ' + s); }
  }
};

if (process.argv[3] === '-dbg') {
  dbgUtil.is = true;
}

module.exports = dbgUtil;
