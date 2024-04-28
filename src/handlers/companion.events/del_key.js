const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  data.item = JSON.parse(data.item);
  const settings = config.settings();
  settings.profiles[settings.profile] = settings.profiles[settings.profile].filter((snd) => {
    const key = Object.keys(snd)[0];
    return snd[key].uuid !== data.item.uuid;
  });
  config.save();
  io.emit(eventNames.default.reload);
};
