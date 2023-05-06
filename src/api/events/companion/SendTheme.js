const Event = require('../Event');

const ev = new Event('c-send-theme', (socket, args) => {
  return 'custom_theme=' + args;
});

module.exports = ev;
