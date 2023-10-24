const path = require("path");
const Plugin = require(path.resolve('./src/classes/Plugin'));
const FreedeckAPI = require(path.resolve('./src/classes/FreedeckAPI'));

module.exports = class MyPlugin extends Plugin {
    constructor() {
        super('Freedeck 6: Example Plugin', 'Freedeck', 'fd.plugins.example');
    }

    onInitialize () {
        console.log('Initialized example plugin.')
        return true;
    }

    onButton(interaction) {
        console.log('Plugin instantiated,button was presed' + interaction.type)
        return true;
    }
}