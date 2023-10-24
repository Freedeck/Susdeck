const path = require("path");
const types = require(path.resolve('./src/pluginLoader.js'))

module.exports = class Plugin {
    name;
    author;
    id;
    disabled;

    constructor(name, author, id, disabled = false) {
        this.name = name;
        this.author = author;
        this.id = id;
        this.disabled = disabled;
        this.hasInit = this.onInitialize();
        if (!this.hasInit) {
            console.log('Plugin didn\'t initialize?');
        }
    }

    registerNewType (name, type) {
        types.types().set(type, {instance: this, display: name});
    }

    onInitialize () {
        return true;
    }

    onButton (interaction) {
        return true;
    }
}
