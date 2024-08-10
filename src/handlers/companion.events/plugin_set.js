const plugins = require('../../managers/plugins');
const fs = require('fs');
const eventNames = require('../eventNames');
const path = require('path');

module.exports = ({io, data}) => {
  data = JSON.parse(data)
  const plugin = plugins._settings.get(data.plugin);
  plugin[data.setting] = data.value;
  fs.writeFile(path.resolve(`./plugins/${data.plugin}/settings.json`), JSON.stringify(plugin), () => {
    console.log('Settings for ' + data.plugin + ' saved');
  });
  io.emit(eventNames.default.reload);
};
