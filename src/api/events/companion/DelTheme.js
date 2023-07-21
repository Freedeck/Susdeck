const Event = require('../Event');

const ev = new Event('c-del-theme', () => {
  return 'custom_theme=del';
});

module.exports = ev;
