const dbg = {
  status: process.argv[3] === 'debug',
  mode: 'Debug',
  setMode: (k) => dbg.mode = k,
  log: (v, k='_unset') => {
    let strToBuild = '';
    if (k !== '_unset') strToBuild += `[${k}] `;
    strToBuild += `${v}`;
    if (dbg.status) console.log(strToBuild);
  },
};

module.exports = dbg;
