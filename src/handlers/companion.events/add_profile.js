const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  const settings = config.settings();
  settings.profiles[data] = [{
    'Back to Home': {
      type: 'fd.profile',
      pos: 0,
      uuid: 'fdc.0.0',
      data: {profile:'Default'},
    },
  }];
  settings.profile = data;
  config.save();
  io.emit(eventNames.default.reload);
};
