const EventEmitter = require('events');

const noman = new EventEmitter();

noman._cache = [];

noman.add = (k, v) => {
  const notification = {sender: k, data: v};
  noman._cache.push(notification);
  noman.emit('newNotification', notification);
};

noman.get = () => {
  return noman._cache.shift();
};

module.exports = noman;
