const Event = require('../Event');

const ev = new Event('c-reset', () => {
  return { type: 'c-reset' };
});

module.exports = ev;
