const path = require('path');
const NotificationManager = require(path.resolve('./src/managers/notifications.js'));
const types = require(path.resolve('./src/managers/plugins.js'));
const fs = require('fs');

module.exports = class Plugin {
  name;
  author;
  jsHook;
  jshPath;
  id;
  disabled = false;
  hasInit = false;

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

  setJSHook(hook) {
    this.jsHook = hook;
    this.jshPath = path.resolve("tmp/_e_._plugins_" + this.id+".Freedeck", this.jsHook);
    if (!fs.existsSync(path.resolve('src/public/hooks/'))) fs.mkdirSync(path.resolve('src/public/hooks/'));
    fs.cpSync(this.jshPath, path.resolve('src/public/hooks/'+this.jsHook));
  }

  getJSHook() {
    return this.jsHook;
  }

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

  getFromSaveData(k) {
    this.createSaveData();
    const data = JSON.parse(fs.readFileSync(path.resolve('./plugins/'+this.id+'/settings.json')));
    return data[k];
  }

  setToSaveData(k, v) {
    this.createSaveData();
    const data = JSON.parse(fs.readFileSync(path.resolve('./plugins/'+this.id+'/settings.json')));
    data[k] = v;
    fs.writeFileSync(path.resolve('./plugins/'+this.id+'/settings.json'), JSON.stringify(data));
  }

  pushNotification(value, options=null) {
    if (!options) NotificationManager.add(this.name, '<br>' + value);
    if (options != {}) {
      if (options.image) {
        NotificationManager.add(this.name, '<br><img src=\''+options.image+'\' width=\'50\' height=\'50\'><br>' + value);
      }
    }
  }

  registerNewType(name, type) {
    this.types.push({name, type});
    types.types().set(type, {instance: this, display: name});
  }

  onInitialize() {
    return true;
  }

  onButton(interaction) {
    return true;
  }
};
