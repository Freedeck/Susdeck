const Event = require('../Event');

const ev = new Event('fd.companion.send-theme', ({ args }) => {
  return { type: 'custom_theme', data: args };
}, true);

module.exports = ev;
