const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({ io, data }) => {
  data = JSON.parse(data);
  data.item = JSON.parse(data.item);
  const settings = config.settings();
  const profile = settings.profiles[settings.profile];
  let flag = false;

  profile.forEach((snd) => {
    for (const key in snd) {
      if (snd[key].uuid === data.item.uuid) {
        // Update positions if there's already something at the new index
        profile.forEach((d) => {
          for (const datn in d) {
            const dat = d[datn];
            if (dat.pos === data.newIndex) {
              dat.pos = data.oldIndex;
            }
          }
        });
        snd[key].pos = data.newIndex;
        flag = true;
        break;
      }
    }
    if (flag) return;
  });

  config.save();
  io.emit(eventNames.default.reload);
};