const Event = require('../Event');

const ev = new Event('c-change', (socket, args) => {
  return 'c-change';
});

module.exports = ev;
