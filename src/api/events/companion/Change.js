const Event = require('../Event');

const ev = new Event('fd.companion.change', () => {
  return { type: 'c-change' };
}, true);

module.exports = ev;
