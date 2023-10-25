const path = require("path");
const NotificationManager = require(path.resolve('./src/loaders/NotificationManager.js'));
const types = require(path.resolve('./src/loaders/pluginLoader.js'))

module.exports = class Plugin {
    name;
    author;
    id;
    disabled;
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
    }

    pushNotification(value) {
        NotificationManager.add(this.name, value);
    }

    registerNewType (name, type) {
        this.types.push({name, type});
        types.types().set(type, {instance: this, display: name});
    }

    onInitialize () {
        return true;
    }

    onButton (interaction) {
        return true;
    }
}
