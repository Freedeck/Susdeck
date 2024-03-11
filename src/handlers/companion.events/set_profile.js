const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  config.settings().profile = data;
  config.save();
  io.emit(eventNames.reload);
};
