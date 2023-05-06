const sounds = require('../../../settings/sounds');
const Event = require('../Event');

const ev = new Event('c-newkey', (socket, args) => {
  sounds.Sounds.push(args);
});

module.exports = ev;
