const { plugins, sockApiEvents } = require('./init');
const debug = require('../util/debug');

class FDPlugin {
  constructor (name, author, type) {
    this.nameStr = name;
    this.authorStr = author;
    this.typeStr = type;
    this.initEvent = this.onInitialize;
    this.hookEvent = this.onEvent;
    plugins.set(this.nameStr, { author: this.authorStr, type: this.typeStr, name: this.nameStr, FDPlugin: this });
    debug.log(name + ' | Plugin', 'Plugins');
    this.onInitialize();
  }

  onInitialize (data) {
    return data;
  }

  registerEvent (type, callback, protectedB = false) {
    return sockApiEvents.set(this.typeStr + type, { callback, event: this.typeStr + type, prot: protectedB });
  }

  init () {
    plugins.set(this.nameStr, { author: this.authorStr, type: this.typeStr, name: this.nameStr, FDPlugin: this });
  }

  set name (name) {
    this.nameStr = name;
  }

  set author (callback) {
    this.authorStr = callback;
  }

  set type (prot) {
    this.type = prot;
  }

  get name () {
    return this.nameStr;
  }

  get author () {
    return this.authorStr;
  }

  get type () {
    return this.typeStr;
  }
}

module.exports = FDPlugin;
