/* eslint-disable no-tabs */
const { sockApiEvents,
	notificationQueue
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
  registerEvent: (type, callback, protectedB = false) => {
    return sockApiEvents.set(type, { callback, event: type, prot: protectedB });
  },

  pushNotification: (notification) => {
    return notificationQueue.push(notification);
  }
};

module.exports = FreedeckAPI;
