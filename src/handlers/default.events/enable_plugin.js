const path = require('path');
const plugins = require('../../managers/plugins');
const eventNames = require('../eventNames');
const fs = require('fs');

module.exports = ({io, data}) => {
  fs.renameSync(path.resolve('./plugins/' + data+'.Freedeck.disabled'), path.resolve('./plugins/' + data+'.Freedeck' ));
  plugins.reload();
  io.emit(eventNames.default.reload);
};
