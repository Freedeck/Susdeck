const eventNames = require('../eventNames');

module.exports = ({io}) => {
  io.emit(eventNames.default.reload);
};
