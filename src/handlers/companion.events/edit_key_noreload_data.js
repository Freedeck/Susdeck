const config = require('../../managers/settings');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  const settings = config.settings();

  settings.profiles[settings.profile].forEach((snd) => {
    const kobj = Object.keys(snd)[0];
    if (snd[kobj].uuid !== data.uuid) return;
    snd[kobj].data[data.key] = data.value;
    config.save();
  });
};
