const { plugins } = require('./init');
const debug = require('../util/debug');

class FDPlugin {
  /**
   *
   * @param {string} name - The name of your plugin
   * @param {string} author - The author of this plugin
   * @param {string} type - The namespace for this plugin
   * @example new MyPlugin("My Cool Plugin!", "John Mangoseed", "Mangoseed.MyFirstPlugin")
   */
  constructor (name, author, type) {
    this.nameStr = name;
    this.authorStr = author;
    this.typeStr = type;
    this.initEvent = this.onInitialize;
    this.hookEvent = this.onEvent;
    this.hookKey = this.onButtonPressed;
    this.init();
    debug.log(name + ' | Plugin', 'Plugins');
  }

  /**
   * @description Run code on plugin initialize.
   * @param {Object} data - Any data that is passed in on initialize.
   * @example onInitialize () {
   *    console.log('Initializing my plugin!')
   *    FreedeckAPI.registerEvent('test', (eventData) => console.log)
   * }
   */
  onInitialize (data) {
    return data;
  }

  /**
   * @description Run code on button pressed.
   * @param {Object} soundData - Freedeck's current sound configuration
   * @param {Object} buttonData - The configuration of the button being pressed
   * @example onButtonPressed (sd, bd) {
   * console.log('Button named ' + bd.name + ' just pressed!')
   * }
   */
  onButtonPressed (soundData, buttonData) {
    return { type: 'none', data: [soundData, buttonData]};
  }

  init () {
    plugins.set(this.typeStr, { author: this.authorStr, type: this.typeStr, name: this.nameStr, FDPlugin: this });
    this.onInitialize();
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
