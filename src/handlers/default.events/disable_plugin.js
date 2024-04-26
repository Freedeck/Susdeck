const path = require('path');
const plugins = require('../../managers/plugins');
const eventNames = require('../eventNames');
const fs = require('fs');

module.exports = ({io, data}) => {
  const currLoaded = plugins.plugins();
  plugin = currLoaded.get(data).instance;
  fs.renameSync(path.resolve('./plugins/' + plugin.id + '.Freedeck'), path.resolve('./plugins/' + plugin.id + '.Freedeck.disabled'));
  console.log('Disabled ' + plugin.name +'(' + plugin.id+')');
  plugins.reload();
  io.emit(eventNames.default.reload);
};
