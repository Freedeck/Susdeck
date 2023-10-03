const Event = require('../Event');

const ev = new Event('c-change', () => {
  return { type: 'c-change' };
}, true);

module.exports = ev;
