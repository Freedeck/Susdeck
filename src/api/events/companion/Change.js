const Event = require('../Event');

const ev = new Event('c-change', () => {
  return 'c-change';
});

module.exports = ev;
