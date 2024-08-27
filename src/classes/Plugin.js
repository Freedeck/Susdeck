const path = require("node:path");
const NotificationManager = require(
  path.resolve("./src/managers/notifications.js"),
);
const types = require(path.resolve("./src/managers/plugins.js"));
const fs = require("node:fs");
const HookRef = require("./HookRef");

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
  Settings = {};
  id;
  disabled = false;
  stopped = false;
  hasInit = false;

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
      console.log("Plugin didn't initialize?");
    }
    // return this;
  }
  hooks = [];

  /**
   * Code to run when the plugin is stopping.
   */
  onStopping() {}

  /**
   * End the plugin.
   */
  stop() {
    this.onStopping();
    this.disabled = true;
    this.stopped = true;
  }

  /**
   * @param {String} hook The JS file that will be loaded into the socket handler
   */
  setJSSocketHook(hook) {
    this.jsSockHook = hook;
    this.jsSockHookPath = path.resolve(
      `tmp/_e_._plugins_${this.id}.Freedeck`,
      this.jsSockHook,
    );
    // this.hooks.push(new HookRef(path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', hook), HookRef.types.socket, hook));
    // this.internalAdd(HookRef.types.socket, hook, )
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
  setJSServerHook(hook) {
    //  this.jsSHook = hook;
    //  this.jsShPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', this.jsSHook);
    // let hp = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', hook);
    // this.hooks.push(new HookRef(hp, HookRef.types.server, hook));
    // if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    // fs.cpSync(hp, path.resolve('src/public/hooks/'+hook));
    this.internalAdd(HookRef.types.server, hook, "webui/hooks/");
  }

  /**
   Internal method for adding hookrefs
   @param {*} type the HookRef type
   @param {*} hook File path to hook
   @param {*} copyTo folder to copy hook to
   */
  internalAdd(type, hook, copyTo) {
    const hp = path.resolve(`tmp/_e_._plugins_${this.id}.Freedeck`, hook);

    if (!fs.existsSync(hp)) {
      console.log(`Source file does not exist: ${hp}`);
      return;
    }

    this.hooks.push(new HookRef(hp, type, hook));

    const destination = path.resolve(copyTo, path.dirname(hook));

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    setImmediate(() => {
      fs.copyFile(hp, path.resolve(destination, path.basename(hook)), (err) => {
        if (err) {
          console.log(`Failed to copy hook: ${err}`);
        } else {
        }
      });
    });
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
  setJSClientHook(hook) {
    //  this.jsCHook = hook
    //  this.jsChPath = path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', this.jsCHook);
    // this.hooks.push(new HookRef(path.resolve('tmp/_e_._plugins_' + this.id+'.Freedeck', hook), HookRef.types.client, hook));
    // if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    // fs.cpSync(this.jsChPath, path.resolve('src/public/hooks/'+this.jsCHook));
    this.internalAdd(HookRef.types.client, hook, "webui/hooks/");
  }

  /**
   * @param {String} file The file you want to import
   */
  addImport(file) {
    this.imports.push(file);
    this.tempImportPath = path.resolve(
      `tmp/_e_._plugins_${this.id}.Freedeck`,
      file,
    );
    fs.cpSync(this.tempImportPath, path.resolve(`webui/hooks/${file}`));
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSServerHook() {
    return this.hooks.filter((ref) => ref.type === HookRef.types.server);
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSClientHook() {
    return this.hooks.filter((ref) => ref.type === HookRef.types.client);
    // return this.jsCHook;
  }

  /**
   * Create save data folders/file structure for the plugin.
   */
  createSaveData() {
    if (!fs.existsSync(path.resolve("./plugins"))) {
      fs.mkdirSync(path.resolve("./plugins"));
      console.log("Failsafe created plugins folder!");
    }
    if (!fs.existsSync(path.resolve(`./plugins/${this.id}`))) {
      fs.mkdirSync(path.resolve(`./plugins/${this.id}`));
      console.log(`Created ${this.id} data folder!`);
    }
    if (!fs.existsSync(path.resolve(`./plugins/${this.id}/settings.json`))) {
      fs.writeFileSync(
        path.resolve(`./plugins/${this.id}/settings.json`),
        JSON.stringify({}),
      );
    }
  }

  /**
   * Get from the save data.
   * @param {String} k The key to get from the save data
   * @return {*} The value from the save data
   */
  getFromSaveData(k) {
    this.createSaveData();
    const data = JSON.parse(
      fs.readFileSync(path.resolve(`./plugins/${this.id}/settings.json`)),
    );
    this.Settings[k] = data[k];
    return data[k];
  }

  /**
   * Add to the save data.
   * @param {String} k The key to set in the save data
   * @param {*} v The data to set in the save data
   */
  setToSaveData(k, v) {
    this.createSaveData();
    const data = JSON.parse(
      fs.readFileSync(path.resolve(`./plugins/${this.id}/settings.json`)),
    );
    data[k] = v;
    this.Settings[k] = v;
    fs.writeFileSync(
      path.resolve(`./plugins/${this.id}/settings.json`),
      JSON.stringify(data),
    );
  }

  /**
   * Add a notification to the queue.
   * @param {String} value The notification's content
   * @param {Object} options Extra options for the notification
   */
  pushNotification(value, options = null) {
    if (!options) NotificationManager.add(this.name, `<br>${value}`);
    if (options != null && Object.keys(options).length > 0) {
      if (options.image) {
        NotificationManager.add(
          this.name,
          `<br><img src='${options.image}' width='50' height='50'><br>${value}`,
        );
      }
    }
  }

  /**
   * Register a new type for Companion
   * @param {String} name The name of the button type
   * @param {String} type The identifier for the button type
   * @param {Object} templateData The data for the button type
   * @param {String} renderType The type of button to render
   */
  registerNewType(name, type, templateData = {}, renderType = "button") {
    this.types.push({
      name,
      type,
      renderType,
      templateData,
      pluginId: this.id,
      display: this.name,
    });
    types
      .types()
      .set(type, { instance: this, display: name, renderType, templateData });
  }

  /**
   * Remove a type from Companion
   * @param {String} type The identifier for the button type
   * @return {Boolean} If the type was removed successfully
   */
  deregisterType(type) {
    if (types.types().has(type)) {
      types.types().delete(type);
      this.types = this.types.filter((t) => t.type !== type);
      return true;
    }
    return false;
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
