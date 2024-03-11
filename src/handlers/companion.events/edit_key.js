const config = require('../../managers/settings');
const eventNames = require('../eventNames');

module.exports = ({io, data}) => {
  data = JSON.parse(data);
  // new name is data.name
  // old name is data.oldName
  const settings = config.settings();
  let flag = false;

  settings.profiles[settings.profile].forEach((snd) => {
    if (!(data.oldName in snd)) return;
    if (snd[data.oldName].uuid !== data.interaction.uuid) return;
    snd[data.name] = snd[data.oldName];
    snd[data.name] = data.interaction;
    if (data.name === data.oldName) return;
    if (flag) return;
    delete snd[data.oldName];
    flag = true;
  });

  config.save();
  io.emit(eventNames.reload);
};
