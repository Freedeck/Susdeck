const path = require('path');
const plugins = require('../../managers/plugins');
const eventNames = require('../eventNames');
const fs = require('fs');

module.exports = ({io, data}) => {
  const currLoaded = plugins.plugins();
  plugin = currLoaded.get(data).instance;
  currLoaded.delete(plugin.id);
  plugin.types.forEach((type) => {
    plugins._tyc.delete(type);
  });
  console.log('Disabled ' + plugin.name +'(' + plugin.id+')');
  fs.renameSync(path.resolve('./plugins/' + plugin.id + '.Freedeck'), path.resolve('./plugins/' + plugin.id + '.Freedeck.disabled'));
  io.emit(eventNames.default.reload);
};
