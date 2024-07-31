const config = require('../../managers/settings');

module.exports = ({ io, data }) => {
  data = JSON.parse(data);
  const settings = config.settings();
  let flag = false;

  settings.profiles[settings.profile].forEach((snd) => {
    for (const key in snd) {
      if (snd[key].uuid === data.uuid) {
        snd[key].data[data.key] = data.value;
        config.save();
        flag = true;
        break;
      }
    }
    if (flag) return;
  });
};