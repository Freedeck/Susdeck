const Event = require('../Event');

const ev = new Event('c-del-theme', (socket, args) => {
  return 'custom_theme=del';
});

module.exports = ev;
