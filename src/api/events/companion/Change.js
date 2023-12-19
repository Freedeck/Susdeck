const Event = require('../Event');

const ev = new Event('fd.companion.change', () => {
  return { type: 'change' };
}, true);

module.exports = ev;
