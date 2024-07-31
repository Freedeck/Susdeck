const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({ io, data }) => {
  data = JSON.parse(data);
  const { name, interaction } = data;
  const settings = config.settings();
  const profiles = settings.profiles[settings.profile];

  profiles.forEach((snd) => {
    for (const key in snd) {
      if (snd[key].uuid === interaction.uuid) {
        snd[name] = interaction;
        if (name !== key) {
          delete snd[key];
        }
        break;
      }
    }
  });

  config.save();
};