const Event = require('../Event');

const ev = new Event('fd.companion.reset', () => {
  return { type: 'c-reset' };
}, true);

module.exports = ev;
