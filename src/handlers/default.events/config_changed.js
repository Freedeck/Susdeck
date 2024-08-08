const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  io.emit(eventNames.default.config_changed, data);
};
