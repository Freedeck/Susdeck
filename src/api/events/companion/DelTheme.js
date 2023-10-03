const Event = require('../Event');

const ev = new Event('c-del-theme', () => {
  return { type: 'custom_theme', data: 'del' };
});

module.exports = ev;
