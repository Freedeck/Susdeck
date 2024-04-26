const eventNames = require('../eventNames');
const plugins = require('../../managers/plugins');

module.exports = ({io}) => {
  plugins.reload();
  io.emit(eventNames.default.plugins_updated);
};
