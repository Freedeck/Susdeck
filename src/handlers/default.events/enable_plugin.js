const path = require('path');
const plugins = require('../../managers/plugins');
const eventNames = require('../eventNames');
const fs = require('fs');

module.exports = ({io, data}) => {
  console.log('Enabling ' + data);
  const newPath = data.split('.disabled')[0];
  fs.renameSync(path.resolve('./plugins/' + data), path.resolve('./plugins/' + newPath));
  plugins.reload();
  io.emit(eventNames.default.reload);
};
