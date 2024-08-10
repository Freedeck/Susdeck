const plugins = require('../../managers/plugins');
const fs = require('fs');
const eventNames = require('../eventNames');
const path = require('path');

module.exports = ({io, data}) => {
  data = JSON.parse(data)
  fs.writeFile(path.resolve(`./plugins/${data.plugin}/settings.json`), JSON.stringify(data.settings), () => {
    console.log('Settings for ' + data.plugin + ' saved');
  });
  plugins.update();
  io.emit(eventNames.default.reload);
};
