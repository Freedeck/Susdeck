const { nbws } = require('./internalNBWSHandler');

module.exports = ({ socket, data }) => {
  nbws.send(data[0], ...data[1]);
}