const eventNames = require('./eventNames');

module.exports = {
  name: 'Companion',
  id: 'fd.handlers.companion',
  exec: ({socket, io}) => {
    Object.keys(eventNames.companion).forEach((event) => {
      socket.on(eventNames.companion[event], (data) => {
        require(`./companion.events/${event}`)({io, socket, data});
      });
    });
  },
};
