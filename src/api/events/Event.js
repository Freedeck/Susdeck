const { sockApiEvents } = require('../init');
const debug = require('../../util/debug');

class Event {
  constructor (event, callback, protectedB = false) {
    this.eventStr = event;
    this.callbackFn = callback;
    this.prot = protectedB;
    sockApiEvents.set(event, { callback: this.callbackFn, event: this.eventStr, prot: this.prot });
    debug.log(event, 'Events');
  }

  init () {
    sockApiEvents.set(this.eventStr, { callback: this.callbackFn, event: this.eventStr, prot: this.prot });
  }

  set event (event) {
    this.eventStr = event;
  }

  set callback (callback) {
    this.callbackFn = callback;
  }

  set protection (prot) {
    this.prot = prot;
  }

  get event () {
    return this.eventStr;
  }

  get callback () {
    return this.callbackFn;
  }

  get protection () {
    return this.prot;
  }
}

module.exports = Event;
