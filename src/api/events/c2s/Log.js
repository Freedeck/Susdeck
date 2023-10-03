const Event = require('../Event');

const ev = new Event('c2s_log', ({ args }) => {
  console.log(args);
  return { type: 'log', data: args };
}, true);

module.exports = ev;
