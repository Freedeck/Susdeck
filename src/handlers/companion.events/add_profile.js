const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  const settings = config.settings();
  settings.profiles[data] = [{
    'Welcome': {
      type: 'fd.none',
      pos: 0,
      uuid: 'fdc.0.0',
      data: {},
    },
  }];
  settings.profile = data;
  config.save();
  io.emit(eventNames.default.reload);
};
