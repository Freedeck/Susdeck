const Event = require('../Event');

const ev = new Event('fd.companion.change-ex', ({ socket }) => {
  return { type: 'c-change-ex', data: socket };
}, true);

module.exports = ev;
