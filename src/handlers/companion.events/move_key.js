const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  data.item = JSON.parse(data.item);
  const settings = config.settings();
  let flag = false;
  settings.profiles[settings.profile].forEach((snd) => {
    if (flag) return;
    if (!(data.name in snd)) return;
    if (snd[data.name].uuid !== data.item.uuid) return;
    // if there's already something there
    settings.profiles[settings.profile].forEach((d) => {
      const datn = Object.keys(d)[0];
      const dat = d[datn];
      if (dat.pos === data.newIndex) {
        dat.pos = data.oldIndex;
      }
    });
    snd[data.name].pos = data.newIndex;
    flag = true;
  });
  config.save();
  io.emit(eventNames.reload);
};
