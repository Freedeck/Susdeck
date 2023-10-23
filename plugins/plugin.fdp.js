const path = require("path");
const Plugin = require(path.resolve('./src/classes/Plugin'));

module.exports = class MyPlugin extends Plugin {
    constructor() {
        super('My First Plugin', 'Freedeck', 'fd.plugins.example');
    }

    onInitialize () {
        console.log('Example plugin loaded.')
        return true;
    }
}