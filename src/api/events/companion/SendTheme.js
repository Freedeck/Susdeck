const Event = require('../Event');

const ev = new Event('c-send-theme', ({ args }) => {
  return { type: 'custom_theme', data: args };
});

module.exports = ev;
