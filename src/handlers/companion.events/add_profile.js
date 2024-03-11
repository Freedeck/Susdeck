const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  const settings = config.settings();
  settings.profiles[data] = [];
  settings.profile = data;
  config.save();
  io.emit(eventNames.reload);
};
