const Event = require('../Event');

const ev = new Event('fd.c2s.data.log', ({ args }) => {
  console.log(args);
  return { type: 'log', data: args };
}, true);

module.exports = ev;
