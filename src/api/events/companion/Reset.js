const Event = require('../Event');

const ev = new Event('c-reset', (socket, args) => {
  return 'c-reset';
});

module.exports = ev;
