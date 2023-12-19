/* eslint-disable no-tabs */
const {
  sockApiEvents,
  notificationQueue,
  apiEvents
} = require('./init');

const FreedeckAPI = {
  /**
	 *
	 * @description Register a socket event.
	 * @param {string} type - The event's name
	 * @param {function} callback - Code to be ran when the event is called
	 * @param {boolean} protectedB - Is this protected by socket authentication?
	 * @returns
	 */
  registerEvent: (type, callback, plugin, protectedB = false) => {
    return sockApiEvents.set(type, { callback, event: type, prot: protectedB, FDPlugin: plugin });
  },
  registerEndpoint: (type, route, exec) => {
    return apiEvents.set(type, { type, route, exec });
  },
  pushNotification: (notification) => {
    return notificationQueue.push(notification);
  }
};

module.exports = FreedeckAPI;
