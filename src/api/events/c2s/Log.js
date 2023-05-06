const Event = require('../Event');

const ev = new Event('c2s_log', (socket, args, isDebug) => {
  if (isDebug) {
    require('../../../util/debug').log(args);
    return;
  }
  console.log(args);
});

module.exports = ev;
