const Event = require('../Event');

const ev = new Event('fd.companion.del-theme', () => {
  return { type: 'custom_theme', data: 'del' };
}, true);

module.exports = ev;
