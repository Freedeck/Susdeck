const Event = require('../Event');

const ev = new Event('c-reset', () => {
  return { type: 'c-reset' };
}, true);

module.exports = ev;
