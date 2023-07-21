const Event = require('../Event');

const ev = new Event('c-reset', () => {
  return 'c-reset';
});

module.exports = ev;
