const { sockApiEvents } = require('./init');

const FreedeckAPI = {
  registerEvent: (type, callback, protectedB = false) => {
    return sockApiEvents.set(type, { callback, event: type, prot: protectedB });
  }
};

module.exports = FreedeckAPI;
