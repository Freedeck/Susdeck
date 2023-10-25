const path = require("path");
const Plugin = require(path.resolve('./src/classes/Plugin'));

module.exports = class MyPlugin extends Plugin {
    constructor() {
        super('Freedeck 6: Example Plugin', 'Freedeck', 'fd.plugins.example', true);
    }

    onInitialize () {
        console.log('Initialized example plugin.')
        return true;
    }

    onButton(interaction) {
        this.pushNotification(interaction.type + ' pressed!');
        return true;
    }
}