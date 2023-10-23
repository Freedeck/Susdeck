const fs = require('fs');
const path = require('path');

const plugins = new Map();

fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
    const plugin = require(path.resolve(`./plugins/${file}`));
    const instantiated = new plugin();
    plugins.set(instantiated.id, {instance: instantiated, plugin});
    console.log('New plugin ' + instantiated.name + ' - ID ' + instantiated.id);
})

module.exports = plugins;