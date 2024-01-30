const path = require('path');
const NotificationManager = require(path.resolve('./src/managers/notifications.js'));
const types = require(path.resolve('./src/managers/plugins.js'));
const fs = require('fs');

module.exports = class Plugin {
  name;
  author;
  jsSHook;
  jsShPath;
  jsCHook;
  jsChPath;
  jsSockHook;
  jsSockHookPath;
  imports = [];
  id;
  disabled = false;
  hasInit = false;
  channelsListening = [];
  channelsSendQueue = [];
  channelsCreated = [];

  channels = {
    create: (channel) => {
      this.channelsCreated.push(channel);
    },
    send: (channel, data) => {
      this.channelsSendQueue.push({channel, data});
    },
    listen: (channel, callback) => {
      this.channelsListening.push({channel, callback});
    },
  };

  /**
   *
   * @param {String} name The name of the plugin
   * @param {String} author The author of the plugin
   * @param {String} id The ID of the plugin
   * @param {String} disabled Is the plugin disabled?
   * @return {Plugin} The plugin instance
   */
  constructor(name, author, id, disabled = false) {
    this.name = name;
    this.author = author;
    this.id = id;
    this.disabled = disabled;
    this.types = [];
    if (this.disabled) return;
    this.hasInit = this.onInitialize();
    if (!this.hasInit) {
      console.log('Plugin didn\'t initialize?');
    }
    return this;
  }

  /**
   * @param {String} hook The JS file that will be loaded into the socket handler
   */
  setJSSocketHook(hook) {
    this.jsSockHook = hook;
    this.jsSockHookPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', this.jsSockHook);
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
  setJSServerHook(hook) {
    this.jsSHook = hook;
    this.jsShPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', this.jsSHook);
    if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    fs.cpSync(this.jsShPath, path.resolve('src/public/hooks/'+this.jsSHook));
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
  setJSClientHook(hook) {
    this.jsCHook = hook;
    this.jsChPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', this.jsCHook);
    if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    fs.cpSync(this.jsChPath, path.resolve('src/public/hooks/'+this.jsCHook));
  }

  /**
   * @param {String} file The file you want to import
   */
  addImport(file) {
    this.imports.push(file);
    this.tempImportPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', file);
    if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    fs.cpSync(this.tempImportPath, path.resolve('src/public/hooks/'+file));
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSServerHook() {
    return this.jsSHook;
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSClientHook() {
    return this.jsCHook;
  }

  /**
   * Create save data folders/file structure for the plugin.
   */
  createSaveData() {
    if (!fs.existsSync(path.resolve('./plugins'))) {
      fs.mkdirSync(path.resolve('./plugins'));
      console.log('Failsafe created plugins folder!');
    }
    if (!fs.existsSync(path.resolve('./plugins/'+this.id))) {
      fs.mkdirSync(path.resolve('./plugins/'+this.id));
      console.log('Created '+this.id+' data folder!');
    }
    if (!fs.existsSync(path.resolve('./plugins/'+this.id+'/settings.json'))) {
      fs.writeFileSync(path.resolve('./plugins/'+this.id+'/settings.json'), JSON.stringify({}));
    }
  }

  /**
   * Get from the save data.
   * @param {String} k The key to get from the save data
   * @return {*} The value from the save data
   */
  getFromSaveData(k) {
    this.createSaveData();
    const data = JSON.parse(fs.readFileSync(path.resolve('./plugins/'+this.id+'/settings.json')));
    return data[k];
  }

  /**
   * Add to the save data.
   * @param {String} k The key to set in the save data
   * @param {*} v The data to set in the save data
   */
  setToSaveData(k, v) {
    this.createSaveData();
    const data = JSON.parse(fs.readFileSync(path.resolve('./plugins/'+this.id+'/settings.json')));
    data[k] = v;
    fs.writeFileSync(path.resolve('./plugins/'+this.id+'/settings.json'), JSON.stringify(data));
  }

  /**
   * Add a notification to the queue.
   * @param {String} value The notification's content
   * @param {Object} options Extra options for the notification
   */
  pushNotification(value, options=null) {
    if (!options) NotificationManager.add(this.name, '<br>' + value);
    if (options != {}) {
      if (options.image) {
        NotificationManager.add(this.name, '<br><img src=\''+options.image+'\' width=\'50\' height=\'50\'><br>' + value);
      }
    }
  }

  /**
   * Register a new type for Companion
   * @param {String} name The name of the button type
   * @param {String} type The identifier for the button type
   */
  registerNewType(name, type) {
    this.types.push({name, type});
    types.types().set(type, {instance: this, display: name});
  }

  /**
   * Code to run when the plugin is initialized.
   * @return {Boolean} If the plugin initialized successfully
   */
  onInitialize() {
    return true;
  }

  /**
   * Code to run when a button that is registered to this plugin is pressed.
   * @param {Object} interaction The button's interaction data
   * @return {Boolean} If the button press/interaction handling was successful
   */
  onButton(interaction) {
    return true;
  }

  /**
   * Check if the plugin is running in the development environment.
   * @return {Boolean} If the development environment is active
   */
  isDev() {
    return false;
  }
};
