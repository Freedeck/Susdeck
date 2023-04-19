const sounds = require('../../../settings/sounds');

module.exports = {
  event: 'c-newkey',
  callback: (socket, args) => {
    sounds.Sounds.push(args);
  }
};
