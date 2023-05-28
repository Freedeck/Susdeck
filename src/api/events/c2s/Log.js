const Event = require('../Event');

const ev = new Event('c2s_log', (socket, args, isDebug) => {
  console.log(args);
});

module.exports = ev;
