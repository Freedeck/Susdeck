const fs = require('fs');
const path = require('path');

const plugins = new Map();

fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
    const plugin = require(path.resolve(`./plugins/${file}`));
    const instantiated = new plugin();
    plugins.set(plugin.name, {instance: instantiated, plugin});
    console.log('New plugin ' + instantiated.name);
})

module.exports = plugins;