const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  data.item = JSON.parse(data.item);
  const settings = config.settings();
  settings.profiles[settings.profile].forEach((snd) => {
    if (!(data.name in snd)) return;
    if (snd[data.name].uuid !== data.item.uuid) return;
    delete snd[data.name];
    settings.profiles[settings.profile] =
    settings.profiles[settings.profile]
        .filter((d) => Object.keys(d).length !== 0);
  });
  config.save();
  io.emit(eventNames.reload);
};
